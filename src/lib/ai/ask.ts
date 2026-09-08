/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Public grounded Q&A core (Vol. 4 #14)
   ---------------------------------------------------------------------------
   /ask lets anyone query the canonical 327-chunk folio corpus. The contract
   is CORPUS-OR-SILENCE:

     · Retrieval runs over the SAME two pools the wizard uses (citation pool,
       public tier 'prithvi' — the strictest caution ladder), with the SAME
       deterministic pattern-bridge boost. No new retrieval path, no new data.
     · If the best RAW similarity is below threshold, the corpus is silent —
       the route answers "the corpus is silent on this" instead of letting an
       LLM improvise. A public surface that can invent Vedic authority is a
       liability, not a feature.
     · Every grounded answer MUST cite folio slugs, and every cited slug is
       validated against the retrieved set — an LLM cannot cite a folio it
       was never shown.
     · Identical (query · retrieved folio set) pairs reuse SynthesisCache
       (ask-cache.ts, 'ask' tier bucket) — cheap by construction.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { LLMMessage } from './llm';
import type { RetrievedChunk } from '@/lib/rag/types';
import { allPatterns } from '@/lib/data/patterns';

// ─── Result contract ───────────────────────────────────────────────────────

export interface AskCitation {
  slug: string;
  section: string;
  /** Normalized similarity of the chunk the citation draws on (0–1). */
  similarity: number;
}

export interface AskGrounded {
  grounded: true;
  answer: string;
  citations: AskCitation[];
  model: string;
  method: 'embedding' | 'keyword';
  cached: boolean;
}

export interface AskSilent {
  grounded: false;
  /** corpus_silent → retrieval too weak; ungrounded_output → LLM broke contract */
  reason: 'corpus_silent' | 'ungrounded_output';
}

export type AskResult = AskGrounded | AskSilent;

// ─── Thresholds (method-aware — the two scores are different units) ────────

/**
 * DEGENERATE-RETRIEVAL floor for the hashed-TFIDF embedder (cosine ∈ [0,1]),
 * recalibrated live 2026-09-08 with scripts/calibrate-ask-floor.ts (Vol. 5 #5):
 *   · in-corpus battery (20 sadhana queries): min 0.047 · p25 0.075
 *   · out-of-corpus battery (10 off-topic queries): min 0.057
 * The two distributions OVERLAP — hashed-TFIDF cosine over the 42-chunk OPEN
 * pool cannot discriminate topical relevance (a cookie recipe outscores most
 * real queries). This floor's job is therefore narrow: reject DEGENERATE
 * retrievals (near-orthogonal vectors — gibberish, URLs, alien vocabularies)
 * before an LLM round-trip is burned, the latency side of Vol. 5 #5. Topical
 * honesty stays with gate #2 (the strict parser + the LLM's own grounded=false),
 * which is where production's honest silences have always come from. The
 * neural embedder swap (EMBED_API_KEY, founder-gated) is what would give this
 * gate real discrimination; recalibrate this floor at that re-bake.
 * 2026-09-08 archaeology: the gate was DEAD in production since Week E —
 * rawTopSimilarity was read after retrieval's normalization pass (constant
 * 1.0), so 0.42 never fired and the gate never silenced anything. The fix
 * that revived the gate is in retrieval.ts; 0.42 would have silenced the
 * ENTIRE corpus in the current embedding space.
 */
export const ASK_MIN_EMBED_SIMILARITY = 0.03;
/** Raw term-overlap floor for the keyword fallback (count of term hits). */
export const ASK_MIN_KEYWORD_SCORE = 3;

export const ASK_TOP_K = 6;

/**
 * Corpus-or-silence gate. Pure — takes the RAW top similarity from
 * retrieval (`rawTopSimilarity`, pre-normalization) plus the method that
 * produced it, because the two scoring schemes are different units.
 */
export function isCorpusSilent(
  rawTopSimilarity: number,
  method: 'embedding' | 'keyword',
): boolean {
  if (method === 'embedding') return rawTopSimilarity < ASK_MIN_EMBED_SIMILARITY;
  return rawTopSimilarity < ASK_MIN_KEYWORD_SCORE;
}

// ─── Pattern-bridge pre-detection ──────────────────────────────────────────

/**
 * Detect pattern mentions in a free-text query so retrieval can apply the
 * deterministic behavioral-bridge boost (Vol. 1 #16). Matches pattern NAME
 * (case-insensitive) or slug words; unknown/absent → empty (fail-soft).
 * Pure and closed over build-time data.
 */
export function patternSlugsMentioned(query: string): string[] {
  const q = query.toLowerCase();
  if (!q.trim()) return [];
  const out: string[] = [];
  for (const p of allPatterns) {
    const name = p.name.toLowerCase();
    const slugWords = p.slug.replace(/-/g, ' ');
    // Seekers say "perfectionist", not "The Perfectionist" — also try the
    // article-stripped name. A miss here only costs the retrieval boost; a
    // hit merely reorders candidates INSIDE the allowed pool (Vol. 1 #16
    // bridge semantics — it never widens the caution filter).
    const bareName = name.startsWith('the ') ? name.slice(4) : null;
    if (q.includes(name) || q.includes(slugWords) || (bareName !== null && q.includes(bareName))) {
      if (!out.includes(p.slug)) out.push(p.slug);
    }
  }
  return out;
}

// ─── Prompt construction ───────────────────────────────────────────────────

const ASK_SYSTEM_PROMPT = `You are the KALKI archivist, answering questions from a curated sadhana corpus (astrokalki.com — Vedic-tantric pattern work, not horoscopy).
You receive a seeker's question and numbered folio chunks retrieved from the corpus.
HARD RULES:
- Answer ONLY from the provided chunks. Never invent mantras, practices, sources, or claims.
- If the chunks do not contain enough to answer, return grounded=false and an empty answer. Silence is a correct answer.
- Every answer must cite 1-4 folio slugs from the provided chunk list. Each entry a BARE slug like "pranava-japa".
- Write for the seeker in second person, plain English, at most 120 words. No medical, financial, or "manifestation" promises.
- Output ONLY a single valid JSON object, no markdown, no commentary:
{"cited_folios":[string],"grounded":boolean,"answer":string}`;

/**
 * Build the LLM messages for an /ask turn. Pure — exported for tests.
 * Chunks are numbered so the model can cite by slug (the slug travels with
 * each chunk; the number is only for the model's attention).
 */
export function buildAskMessages(query: string, chunks: readonly RetrievedChunk[]): LLMMessage[] {
  const corpus = chunks
    .map((c, i) => `[${i + 1}] slug: ${c.slug} · section: ${c.section} · caution: ${c.caution}\n${c.text}`)
    .join('\n\n---\n\n');
  return [
    {
      role: 'user',
      content: `Corpus chunks:\n${corpus}\n\nSeeker's question: "${query}"\n\nAnswer per the rules.`,
    },
  ];
}

export function askSystemPrompt(): string {
  return ASK_SYSTEM_PROMPT;
}

// ─── Output parsing (strict) ───────────────────────────────────────────────

export interface ParsedAskOutput {
  answer: string;
  citedSlugs: string[];
}

/**
 * Strict parser for the LLM's JSON output. Returns null on ANY contract
 * breach: unparseable JSON, grounded=false, empty answer, no citations, or
 * ANY citation that is not in the retrieved slug set. The route turns null
 * into silence — never into a best-effort answer.
 */
export function parseAskOutput(
  text: string,
  retrievedSlugs: readonly string[],
): ParsedAskOutput | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const obj = parsed as { grounded?: unknown; answer?: unknown; cited_folios?: unknown };
  if (obj.grounded !== true) return null;
  if (typeof obj.answer !== 'string') return null;
  const answer = obj.answer.trim();
  if (answer.length === 0) return null;
  if (!Array.isArray(obj.cited_folios) || obj.cited_folios.length === 0) return null;

  const allowed = new Set(retrievedSlugs);
  const cited: string[] = [];
  for (const raw of obj.cited_folios) {
    if (typeof raw !== 'string') return null;
    // Accept only bare slugs that exist in the retrieved set. Trim alone
    // defends against whitespace but NOT trailing punctuation (the 2026-09-08
    // truth-gate catch: "pranava-japa." failed the pool check and silenced a
    // valid answer) — strip trailing punctuation, then lower-case. The
    // strictness stays deliberate: a slug the model never saw cannot be cited.
    const slug = raw
      .trim()
      .toLowerCase()
      .replace(/[.,;:!?"'`)\]}]+$/g, '');
    if (!allowed.has(slug)) return null;
    if (!cited.includes(slug)) cited.push(slug);
  }
  if (cited.length === 0) return null;
  return { answer, citedSlugs: cited };
}

// ─── Response assembly ─────────────────────────────────────────────────────

/**
 * Attach citation metadata (section, similarity) to the LLM's cited slugs.
 * Order follows the LLM's citation order; unknown slugs cannot reach here
 * (parseAskOutput already validated them).
 */
export function buildCitations(
  citedSlugs: readonly string[],
  chunks: readonly RetrievedChunk[],
): AskCitation[] {
  const bySlug = new Map<string, RetrievedChunk>();
  for (const c of chunks) if (!bySlug.has(c.slug)) bySlug.set(c.slug, c);
  return citedSlugs.flatMap((slug) => {
    const c = bySlug.get(slug);
    return c ? [{ slug, section: c.section, similarity: c.similarity }] : [];
  });
}
