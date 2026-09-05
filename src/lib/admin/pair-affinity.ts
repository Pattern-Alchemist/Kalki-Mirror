/**
 * PATTERN-PAIR AFFINITY — Vol. 2 #7 (derived intelligence, not vibes)
 *
 * Wizard step 2 asks seekers which patterns resonate; submissions store
 * the slug list in Consultation.patternSlugs (JSON array). This module is
 * the PURE half of the pipeline: turn many slug lists into ranked pairs.
 * The nightly digest cron runs the DB half — read window, upsert cache —
 * and pattern folios read the cache for their "most common companions"
 * line.
 *
 * Conventions:
 *   · canonical pair order is alphabetical (slugA < slugB) so lookups on
 *     either folio hit one row
 *   · duplicates inside one submission collapse (a seeker selecting a
 *     pattern twice is one co-occurrence, not two)
 *   · unknown/dirty slugs are the caller's problem — here they just count
 */

export interface PairAffinityRow {
  slugA: string;
  slugB: string;
  pairCount: number;
}

/** Canonical (alphabetical) ordering of a pair. */
export function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Rank pattern pairs by co-occurrence across submissions.
 * Deterministic: equal counts keep first-seen order (Map insertion), so
 * tests and the nightly recompute are stable.
 */
export function buildPairAffinities(lists: string[][]): PairAffinityRow[] {
  const counts = new Map<string, PairAffinityRow>();

  for (const list of lists) {
    const slugs = [...new Set(list.map((s) => (s ?? '').trim().toLowerCase()).filter(Boolean))].sort();
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        const [slugA, slugB] = canonicalPair(slugs[i], slugs[j]);
        const key = `${slugA}|${slugB}`;
        const row = counts.get(key);
        if (row) row.pairCount += 1;
        else counts.set(key, { slugA, slugB, pairCount: 1 });
      }
    }
  }

  return [...counts.values()].sort((x, y) => y.pairCount - x.pairCount);
}

/** Companions of one slug from a full affinity table (best first). */
export function companionsOf(
  rows: PairAffinityRow[],
  slug: string,
  limit = 3,
): Array<{ slug: string; pairCount: number }> {
  const norm = slug.trim().toLowerCase();
  return rows
    .filter((r) => r.slugA === norm || r.slugB === norm)
    .map((r) => ({ slug: r.slugA === norm ? r.slugB : r.slugA, pairCount: r.pairCount }))
    .sort((x, y) => y.pairCount - x.pairCount)
    .slice(0, limit);
}
