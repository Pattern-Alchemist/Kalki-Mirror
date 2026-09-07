/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — /ask answer cache (Vol. 4 #14)
   ---------------------------------------------------------------------------
   Reuses the YANTRA SynthesisCache table (same DB, same key derivation via
   synthesisCacheKey()) with a dedicated 'ask' tier bucket so an /ask entry
   can never be served as a yantra synthesis or vice versa:

     key = sha256( norm(query) · '' (no patterns) · folio slugs · 'ask' )

   The folio slugs in the key are the RETRIEVED set (pre-LLM), so an
   identical query with identical retrieval hits the cache even before the
   answer is regenerated. Same TTL/fail-open discipline as the yantra side:
   a cold/absent/broken cache is exactly the no-cache behaviour.
   ═══════════════════════════════════════════════════════════════════════════ */

import { db } from '@/lib/db';
import { synthesisCacheKey, recordSynthesisHit } from './synthesis-cache';

const TTL_DAYS = 7;

export interface AskCacheOutput {
  answer: string;
  cited_folios: string[];
}

export function askCacheKey(query: string, retrievedSlugs: readonly string[]): string {
  return synthesisCacheKey({
    behavioralQuery: query,
    patterns: [],
    folioSlugs: [...retrievedSlugs],
    tier: 'ask',
  });
}

/**
 * Look up a cached /ask answer. Returns null on miss, expiry, contract
 * breach, or any storage failure — all paths degrade to "synthesize fresh".
 */
export async function lookupAsk(
  cacheKey: string,
): Promise<{ output: AskCacheOutput; model: string } | null> {
  try {
    const row = await db.synthesisCache.findUnique({
      where: { cacheKey },
      select: { output: true, model: true, expiresAt: true },
    });
    if (!row) return null;
    if (row.expiresAt.getTime() <= Date.now()) return null; // lazy expiry
    const parsed = JSON.parse(row.output) as Partial<AskCacheOutput>;
    if (typeof parsed?.answer !== 'string' || parsed.answer.trim().length === 0) return null;
    if (
      !Array.isArray(parsed?.cited_folios) ||
      parsed.cited_folios.length === 0 ||
      !parsed.cited_folios.every((s) => typeof s === 'string' && s.length > 0)
    ) {
      return null; // contract breach → treat as a miss
    }
    return { output: parsed as AskCacheOutput, model: row.model };
  } catch {
    return null;
  }
}

/**
 * Persist a fresh /ask answer (fire-and-forget by contract). Upserts over
 * the key so a re-synthesized entry refreshes its TTL instead of colliding.
 */
export async function storeAsk(
  cacheKey: string,
  output: AskCacheOutput,
  model: string,
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
    await db.synthesisCache.upsert({
      where: { cacheKey },
      create: { cacheKey, output: JSON.stringify(output), model, expiresAt },
      update: { output: JSON.stringify(output), model, expiresAt, hits: 0 },
    });
  } catch {
    // cache write is a convenience, never a dependency
  }
}

/** Increment the hit counter — observability only, fully fire-and-forget. */
export function recordAskHit(cacheKey: string): void {
  recordSynthesisHit(cacheKey);
}
