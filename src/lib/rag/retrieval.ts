import { staticDb } from '@/lib/static-db';
import type { Tier } from '@/lib/data/types';
import type { RetrievedChunk, RetrievalPool } from './types';
import { TIER_TO_CAUTION, PRESCRIPTION_CAUTIONS, type CautionLevel } from './caution-map';
import { embedQueryText } from './embed';

// ─── Cosine similarity ────────────────────────────────────────────────────

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function magnitude(a: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

function cosineSim(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  return dot(a, b) / (magnitude(a) * magnitude(b) || 1);
}

// ─── Keyword fallback (TF overlap scoring) ────────────────────────────────
// When no embeddings are stored, we score by term overlap.
// Simple but effective for ~300 chunks.

function keywordScore(query: string, text: string): number {
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with','by','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','this','that','these','those','it','its','not','no','from','as','if','then','than','into','about','which','who','whom','whose','what','where','when','how','all','each','every','both','few','more','most','other','some','such','only','same','so','too','very',
  ]);
  const queryTerms = query.toLowerCase().split(/[^a-zA-ZÀ-ÿ0-9]+/).filter(t => t.length > 2 && !stopWords.has(t));
  const textLower = text.toLowerCase();
  let score = 0;
  for (const term of queryTerms) {
    const regex = new RegExp(term, 'gi');
    const matches = textLower.match(regex);
    if (matches) score += matches.length;
  }
  return score;
}

// ─── Embed the query ──────────────────────────────────────────────────────
// Leak L4: the query embedder is LOCAL and deterministic (hashed TF-IDF over
// the baked IDF map) — zero latency, zero API keys, zero failure modes.
// The stored chunk vectors come from scripts/bake-folio-embeddings.ts using
// the exact same embedText() contract, so cosine is always apples-to-apples.
// If a neural provider is added later: re-bake the corpus, and swap only
// embedQueryText — nothing else in this file changes.

async function embedQuery(text: string): Promise<number[]> {
  return embedQueryText(text);
}

// ─── Two-pool retrieval ────────────────────────────────────────────────────

export interface RetrievalResult {
 chunks: RetrievedChunk[];
 queryEmbedding: number[];  // empty if keyword fallback was used
  method: 'embedding' | 'keyword';
}

/**
 * Retrieve folio chunks for a given query and pool.
 *
 * Pool P (prescription): OPEN only. Feeds prescribed_sadhana.
 * Pool C (citation):    filtered by user tier. Feeds archetype + tantric_citation.
 *
 * Returns top-k chunks sorted by similarity.
 */
export async function retrieveChunks(
  query: string,
  pool: RetrievalPool,
  options?: {
    tier?: Tier;
    k?: number;
    sectionFilter?: string[];
  }
): Promise<RetrievalResult> {
  const tier = options?.tier ?? 'prithvi';
  const k = options?.k ?? 6;
  const sectionFilter = options?.sectionFilter;

  // Determine which caution levels to query
  const allowedCautions: CautionLevel[] = pool === 'prescription'
    ? PRESCRIPTION_CAUTIONS
    : TIER_TO_CAUTION[tier];

  // Fetch candidate chunks from DB (embedding column is always populated
  // post-L4 bake; kept in the select so fresh unbaked corpora still fall
  // through to the keyword path below)
  const candidates = await staticDb.folioChunk.findMany({
    where: {
      caution: { in: allowedCautions },
      ...(sectionFilter ? { section: { in: sectionFilter } } : {}),
    },
    select: {
      slug: true,
      section: true,
      caution: true,
      text: true,
      embedding: true,
    },
  });

  // Embed the query
  const queryEmb = await embedQuery(query);
  const useEmbedding = queryEmb.length > 0 && candidates.some(c => {
    try { return JSON.parse(c.embedding).length > 0; } catch { return false; }
  });

  // Score each candidate
  const scored: RetrievedChunk[] = candidates.map(c => {
    let similarity: number;

    if (useEmbedding) {
      let emb: number[] = [];
      try { emb = JSON.parse((c as Record<string, unknown>).embedding as string ?? '[]'); } catch { /* */ }
      similarity = cosineSim(queryEmb, emb);
    } else {
      similarity = keywordScore(query, c.text);
    }

    return {
      slug: c.slug,
      section: c.section,
      caution: c.caution,
      text: c.text,
      similarity,
    };
  });

  // Sort by similarity descending, take top-k
  scored.sort((a, b) => b.similarity - a.similarity);
  const top = scored.slice(0, k);

  // Normalize similarity scores (0-1 range)
  const maxSim = top[0]?.similarity || 1;
  for (const chunk of top) {
    chunk.similarity = maxSim > 0 ? chunk.similarity / maxSim : 0;
  }

  return {
    chunks: top,
    queryEmbedding: queryEmb,
    method: useEmbedding ? 'embedding' : 'keyword',
  };
}

/**
 * Convenience: retrieve prescription chunks (OPEN only).
 */
export async function retrievePrescription(
  query: string,
  options?: { k?: number }
): Promise<RetrievalResult> {
  return retrieveChunks(query, 'prescription', {
    ...options,
    sectionFilter: ['summary', 'benefits', 'mantra'],
  });
}

/**
 * Convenience: retrieve citation chunks (tier-filtered).
 */
export async function retrieveCitation(
  query: string,
  tier: Tier,
  options?: { k?: number }
): Promise<RetrievalResult> {
  return retrieveChunks(query, 'citation', {
    tier,
    ...options,
    sectionFilter: ['summary', 'lineage', 'bibliography', 'warnings'],
  });
}
