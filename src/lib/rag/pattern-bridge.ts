/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Behavioral bridge for RAG (Vol. 1 #16)
   ---------------------------------------------------------------------------
   The corpus documents *practices* (siddhi folios), not *psychology*. A
   behavioral query ("I procrastinate because starting imperfectly feels
   like failure") lexically matches pattern language, not folio language —
   so pure similarity retrieval can crowd out the exact folios a seeker's
   dominant pattern is archetypally linked to.

   This module is the deterministic bridge: each Pattern already declares
   `relatedSiddhis` — the folio slugs its archetype maps to. bridgeSlugsFor()
   resolves a seeker's selected patterns to that closed set of folio slugs,
   and retrieval applies a fixed similarity boost so those chunks cannot be
   crowded out by lexical noise.

   GATING IS UNCHANGED: a boosted chunk still passes the pool's caution
   filter (prescription = OPEN only; citation = tier ladder). The bridge
   reorders candidates inside the allowed pool — it never widens access.

   Corpus sync is enforced by tests/lib/pattern-bridge.test.ts (every mapped
   slug must exist in the baked FolioChunk corpus) and scripts/corpus-audit.ts
   in CI fails the reverse direction (DB slugs with no backing folio).
   ═══════════════════════════════════════════════════════════════════════════ */

import { allPatterns } from '@/lib/data/patterns';

/**
 * pattern slug → folio (siddhi) slugs, derived from the canonical pattern
 * corpus. Frozen at module load — this is build-time data, not runtime state.
 */
export const PATTERN_FOLIO_BRIDGE: Readonly<Record<string, readonly string[]>> =
  Object.freeze(
    Object.fromEntries(
      allPatterns.map((p) => [p.slug, Object.freeze([...p.relatedSiddhis])]),
    ),
  );

/**
 * Resolve seeker-selected pattern slugs to the deduped union of their
 * linked folio slugs. Unknown pattern slugs are ignored (fail-soft — a
 * stale client slug must never crash retrieval).
 */
export function bridgeSlugsFor(patternSlugs: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const slug of patternSlugs) {
    for (const folio of PATTERN_FOLIO_BRIDGE[slug] ?? []) {
      if (!seen.has(folio)) {
        seen.add(folio);
        out.push(folio);
      }
    }
  }
  return out;
}

/**
 * Resolve pattern NAMES (as carried in /api/yantra's context payload,
 * which speaks names not slugs) to folio slugs. Unknown names ignored.
 */
export function bridgeSlugsForNames(patternNames: readonly string[]): string[] {
  const byName = new Map(allPatterns.map((p) => [p.name, p.slug]));
  return bridgeSlugsFor(
    patternNames.map((n) => byName.get(n) ?? ''),
  );
}
