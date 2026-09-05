/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — FolioChunk embedding layer (Leak L4: RAG memory)
   ---------------------------------------------------------------------------
   Deterministic, dependency-free lexical embeddings (hashed TF-IDF).

   DECISION RECORD (2026-09-05, L4 build):
   - OpenRouter was probed live: 431 models served, ZERO embedding endpoints
     (POST /v1/embeddings → 404 "No endpoints found" for qwen3-embedding).
   - No OpenAI/Gemini/Jina key exists in the stack; adding a vendor key was
     rejected (new vendor + cost + rotation surface for a 279-chunk corpus).
   - For 279 static chunks, IDF-weighted hashed TF-IDF + cosine gives
     high-precision lexical retrieval, and — critically — the storage and
     query contract is IDENTICAL to neural vectors (JSON float array in
     FolioChunk.embedding + cosine at query time). When a real embedding
     provider lands, regenerate via `npx tsx scripts/bake-folio-embeddings.ts`
     (point EMBED_MODEL at the provider) and nothing else changes.

   CONTRACT (shared by the bake script and the runtime query embedder —
   both call embedText(); the IDF lookup is generated into
   src/lib/rag/idf-generated.ts and must be regenerated whenever the
   corpus changes, or OOV terms will silently use the default IDF):
     1. Normalize: lowercase; IAST diacritics folded to ASCII (ā→a, ṣ→s …);
        Devanagari runs preserved as-is.
     2. Terms: unigrams + adjacent bigrams over [a-z0-9]+ / Devanagari runs.
     3. Weight: (1 + ln tf) × idf(term); idf = ln((N+1)/(df+1)) + 1.
        OOV terms use the corpus default idf ln(N+1)+1.
     4. Hash: FNV-1a 32-bit → bucket = h % EMBED_DIM (2048; ~4 terms/bucket
        at the current ~8k-term vocabulary — keeps collision noise low),
     5. Components rounded to 6 decimals and L2-normalized.
   ═══════════════════════════════════════════════════════════════════════════ */

export const EMBED_DIM = 2048;
export const EMBED_MODEL = 'hashed-tfidf-v1';

/** IAST / transliteration folding — applied after lowercase. */
const IAST_FOLD: Record<string, string> = {
  ā: 'a', ī: 'i', ū: 'u', ṛ: 'r', ṝ: 'r', ḷ: 'l', ḹ: 'l',
  ē: 'e', ō: 'o', ṅ: 'n', ñ: 'n', ṭ: 't', ḍ: 'd', ṇ: 'n',
  ś: 's', ṣ: 's', ḥ: 'h', ṃ: 'm', ṁ: 'm', ḿ: 'm', m̥: 'm', r̥: 'r', l̥: 'l',
  à: 'a', á: 'a', â: 'a', ä: 'a', ả: 'a', ạ: 'a', ã: 'a',
  è: 'e', é: 'e', ê: 'e', ė: 'e', ẹ: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i', ị: 'i',
  ò: 'o', ó: 'o', ô: 'o', ö: 'o', ọ: 'o', õ: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u', ụ: 'u',
  ç: 'c', ć: 'c', č: 'c', ź: 'z', ž: 'z', ż: 'z', ń: 'n', ň: 'n',
};

function foldIast(lower: string): string {
  let out = '';
  for (const ch of lower) out += IAST_FOLD[ch] ?? ch;
  return out;
}

/** FNV-1a 32-bit — stable across JS runtimes (Math.imul, no BigInt). */
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Tokenizer shared with the bake script's document-frequency pass.
 * Unigrams + adjacent bigrams ("word word") over ASCII-word and
 * Devanagari runs. Bigrams are distinct terms in the same space.
 */
export function tokenTerms(text: string): string[] {
  const folded = foldIast(text.toLowerCase());
  const runs = folded.match(/[a-z0-9]+|[\u0900-\u097F]+/g) ?? [];
  const terms: string[] = [];
  for (let i = 0; i < runs.length; i++) {
    terms.push(runs[i]);
    if (i > 0) terms.push(`${runs[i - 1]} ${runs[i]}`);
  }
  return terms;
}

export type IdfLookup = (term: string) => number;

/** Default IDF for OOV terms — matches the bake script's smoothing. */
export function defaultIdf(corpusSize: number): number {
  return Math.log(corpusSize + 1) + 1;
}

/** Build the runtime IDF lookup from a generated term→idf map. */
export function makeIdfLookup(
  map: Record<string, number>,
  corpusSize: number
): IdfLookup {
  const fallback = defaultIdf(corpusSize);
  return (term: string) => map[term] ?? fallback;
}

/**
 * The embedder. Same function on both sides of the pipeline:
 *   bake:  embedText(chunk.text, idfFromCorpus)  → stored in FolioChunk.embedding
 *   query: embedText(userQuery, makeIdfLookup(IDF, CORPUS_SIZE)) → cosine
 */
export function embedText(text: string, idf: IdfLookup): number[] {
  const vec = new Float64Array(EMBED_DIM);

  const tf = new Map<string, number>();
  for (const t of tokenTerms(text)) tf.set(t, (tf.get(t) ?? 0) + 1);

  for (const [term, count] of tf) {
    const weight = (1 + Math.log(count)) * idf(term);
    vec[fnv1a32(term) % EMBED_DIM] += weight;
  }

  let norm = 0;
  for (let i = 0; i < EMBED_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;

  const out = new Array<number>(EMBED_DIM);
  for (let i = 0; i < EMBED_DIM; i++) {
    out[i] = Math.round((vec[i] / norm) * 1e6) / 1e6;
  }
  return out;
}

// ─── Runtime query path ───────────────────────────────────────────────────
// Uses the baked IDF map (src/lib/rag/idf-generated.ts, regenerated by the
// bake script whenever the corpus changes). OOV terms fall back to the
// corpus default idf inside makeIdfLookup — matching the bake side.

import { IDF, CORPUS_SIZE } from './idf-generated';

export function embedQueryText(text: string): number[] {
  return embedText(text, makeIdfLookup(IDF, CORPUS_SIZE));
}
