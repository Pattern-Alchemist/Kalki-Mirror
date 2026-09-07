/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Neural-embed swap readiness (Vol. 4 #16)
   ---------------------------------------------------------------------------
   The neural swap is founder-gated (EMBED_API_KEY). A gated key must mean
   ONE command, not a research project — so every precondition the swap
   depends on is checked mechanically here, keyless, ahead of time:

     · the generated IDF module (idf-generated.ts) is IN SYNC with the
       baked corpus (db/custom.db) — if the corpus drifted after the last
       bake, the swap would silently embed against a stale IDF map;
     · the fingerprint of both maps agrees — one hash instead of 9,766
       hand-checked numbers.

   Pure module (no fs, no DB) so vitest pins the verdict logic directly;
   scripts/neural-swap-fingerprint.ts feeds it real corpus data and
   scripts/rehearse-neural-swap.sh orchestrates the full rehearsal.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createHash } from 'crypto';

/** Round to the bake precision (6 dp — matches bake-folio-embeddings.ts). */
function round6(v: number): number {
  return Math.round(v * 1e6) / 1e6;
}

/**
 * Canonical, order-independent fingerprint of an IDF map: terms sorted,
 * values rounded to bake precision, `term=value` lines joined by \n, SHA-256.
 * Two maps that assign identical 6-dp idf values to identical term sets
 * ALWAYS produce the same fingerprint.
 */
export function canonicalIdfFingerprint(idf: Record<string, number>): string {
  const lines = Object.keys(idf)
    .sort()
    .map((t) => `${t}=${round6(idf[t])}`);
  return createHash('sha256').update(lines.join('\n'), 'utf8').digest('hex');
}

export interface IdfSyncInput {
  /** Recomputed IDF over the CURRENT corpus (term → idf). */
  recomputed: Record<string, number>;
  /** The generated module's IDF table (src/lib/rag/idf-generated.ts). */
  generated: Record<string, number>;
  /** FolioChunk row count in the live corpus DB. */
  corpusRows: number;
  /** CORPUS_SIZE exported by the generated module. */
  generatedCorpusSize: number;
  /** Max terms listed per drift bucket in the verdict (bounded output). */
  sampleLimit?: number;
}

export interface IdfSyncVerdict {
  inSync: boolean;
  corpusCountMatches: boolean;
  corpusRows: number;
  generatedCorpusSize: number;
  recomputedVocab: number;
  generatedVocab: number;
  recomputedFingerprint: string;
  generatedFingerprint: string;
  /** In recomputed but missing from generated (corpus gained terms). */
  missing: string[];
  /** In generated but absent from the current corpus (corpus lost terms). */
  extra: string[];
  /** Present in both but with value drift beyond 1e-6. */
  drifted: Array<{ term: string; recomputed: number; generated: number }>;
}

/**
 * Compare the recomputed IDF against the generated module. A swap is safe
 * only when `inSync` is true — counts match, term sets match, values match
 * to bake precision. Any drift means: RE-BAKE FIRST, then swap.
 */
export function idfSyncVerdict(input: IdfSyncInput): IdfSyncVerdict {
  const sampleLimit = input.sampleLimit ?? 12;
  const missing: string[] = [];
  const extra: string[] = [];
  const drifted: Array<{ term: string; recomputed: number; generated: number }> = [];

  for (const [term, value] of Object.entries(input.recomputed)) {
    const g = input.generated[term];
    if (g === undefined) missing.push(term);
    else if (Math.abs(round6(g) - round6(value)) > 1e-6) {
      drifted.push({ term, recomputed: round6(value), generated: round6(g) });
    }
  }
  for (const term of Object.keys(input.generated)) {
    if (input.recomputed[term] === undefined) extra.push(term);
  }

  const corpusCountMatches = input.corpusRows === input.generatedCorpusSize;
  const recomputedFingerprint = canonicalIdfFingerprint(input.recomputed);
  const generatedFingerprint = canonicalIdfFingerprint(input.generated);

  return {
    inSync:
      corpusCountMatches &&
      missing.length === 0 &&
      extra.length === 0 &&
      drifted.length === 0,
    corpusCountMatches,
    corpusRows: input.corpusRows,
    generatedCorpusSize: input.generatedCorpusSize,
    recomputedVocab: Object.keys(input.recomputed).length,
    generatedVocab: Object.keys(input.generated).length,
    recomputedFingerprint,
    generatedFingerprint,
    missing: missing.sort().slice(0, sampleLimit),
    extra: extra.sort().slice(0, sampleLimit),
    drifted: drifted.slice(0, sampleLimit),
  };
}

// ─── Cost estimate (canonical chunk count → tokens → USD) ──────────────────

export interface SwapCostEstimate {
  corpusChunks: number;
  avgChunkChars: number;
  totalChars: number;
  /** 4 chars ≈ 1 token — the honest ballpark for pricing ahead of a key. */
  estimatedTokens: number;
  pricePerMillionUsd: number;
  estimatedBakeCostUsd: number;
}

/**
 * Estimate the bake cost from the canonical chunk count and observed chunk
 * sizes. The spec: "prints the cost estimate from the canonical chunk count
 * (327)". Provider-agnostic — the price per 1M tokens is a parameter, so the
 * rehearsal stays useful whichever vendor the founder gates.
 */
export function estimateSwapCost(
  corpusChunks: number,
  totalChars: number,
  pricePerMillionUsd: number,
): SwapCostEstimate {
  const safeChunks = Math.max(0, Math.floor(corpusChunks));
  const avgChunkChars = safeChunks > 0 ? Math.round(totalChars / safeChunks) : 0;
  const estimatedTokens = Math.ceil(totalChars / 4);
  return {
    corpusChunks: safeChunks,
    avgChunkChars,
    totalChars,
    estimatedTokens,
    pricePerMillionUsd,
    estimatedBakeCostUsd:
      Math.round((estimatedTokens / 1_000_000) * pricePerMillionUsd * 1e6) / 1e6,
  };
}
