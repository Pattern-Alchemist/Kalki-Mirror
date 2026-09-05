/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — YANTRA synthesis cache (Tier-5 #6)
   ---------------------------------------------------------------------------
   Identical intake geometry used to re-pay the LLM on every dossier: same
   query, same matched patterns, same retrieved folios → same synthesis.
   This module sits in front of the OpenRouter call:

     key   = sha256( normalized query · pattern names · folio slugs · tier )
     hit   = cached SynthesisOutput returned, zero LLM cost, hits incremented
     miss  = caller synthesizes, then storeSynthesis() persists for 7 days

   Design rules:
     · SOFT-FAIL EVERYWHERE. A cold/absent/broken cache is exactly the
       pre-Tier-5 behaviour — lookupSynthesis returns null, storeSynthesis
       swallows. The dossier must never fail because a cache table does.
     · The key excludes the transit summary ON PURPOSE: prescriptions and
       citations are pattern-driven, and the 7-day TTL bounds any transit
       drift in the prose. Including the daily transit would gut the hit rate.
     · Tier is part of the key ("level bucket") — a prithvi dossier must not
       serve an akash-grounded citation pool.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createHash } from "crypto";
import { db } from "@/lib/db";
import type { SynthesisOutput } from "./yantra-synthesize";

const TTL_DAYS = 7;

export interface SynthesisCacheKeyInput {
  behavioralQuery: string;
  patterns: Array<{ name: string; subtitle?: string }>;
  folioSlugs: string[];
  tier: string;
}

/** Normalize prose so trivial whitespace/case differences still hit. */
function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function synthesisCacheKey(input: SynthesisCacheKeyInput): string {
  const parts = [
    norm(input.behavioralQuery),
    input.patterns.map((p) => norm(p.name)).sort().join("|"),
    [...new Set(input.folioSlugs)].sort().join("|"),
    input.tier,
  ];
  return createHash("sha256").update(parts.join("\u0000")).digest("hex");
}

/**
 * Look up a cached synthesis. Returns null on miss, expiry, corruption, or
 * any storage failure — all paths degrade to "synthesize fresh".
 */
export async function lookupSynthesis(
  cacheKey: string
): Promise<{ output: SynthesisOutput; model: string } | null> {
  try {
    const row = await db.synthesisCache.findUnique({
      where: { cacheKey },
      select: { output: true, model: true, expiresAt: true },
    });
    if (!row) return null;
    if (row.expiresAt.getTime() <= Date.now()) return null; // lazy expiry
    const parsed = JSON.parse(row.output) as SynthesisOutput;
    if (
      typeof parsed?.karmic_loop !== "string" ||
      typeof parsed?.prescription_line !== "string" ||
      typeof parsed?.citation_line !== "string" ||
      !Array.isArray(parsed?.cited_folios) ||
      parsed.cited_folios.length === 0
    ) {
      return null; // contract breach → treat as a miss
    }
    return { output: parsed, model: row.model };
  } catch {
    return null;
  }
}

/**
 * Persist a fresh synthesis (fire-and-forget by contract). Upserts over the
 * key so a re-synthesized entry refreshes its TTL instead of colliding.
 */
export async function storeSynthesis(
  cacheKey: string,
  output: SynthesisOutput,
  model: string
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
export function recordSynthesisHit(cacheKey: string): void {
  db.synthesisCache
    .update({ where: { cacheKey }, data: { hits: { increment: 1 } } })
    .catch(() => {});
}
