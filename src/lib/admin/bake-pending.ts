// =============================================================
// KALKI — Bake-pending indicator (Vol. 5 #7)
// -------------------------------------------------------------
// The studio authors content into ContentEntry (Turso); the ask/
// retrieval corpus reads the BAKED FolioChunk table (db/custom.db,
// committed). Those two worlds drift silently the moment someone
// publishes a folio and forgets the bake ritual — retrieval never
// sees the new folio and nothing complains.
//
// This module is the complaint. Pure diff: published ContentEntry
// slugs vs distinct FolioChunk slugs in the baked corpus. The
// war-room panel renders it; a non-zero pending list is the "bake
// pending" sign the studio never had.
// =============================================================

export interface BakePendingEntry {
  slug: string;
  type: string;
  status: string;
}

export interface BakePendingReport {
  available: true;
  /** Published ContentEntry rows considered for the corpus. */
  publishedEntries: number;
  /** Distinct slugs in the baked FolioChunk corpus. */
  corpusSlugs: number;
  /** Published entries whose slug has NO FolioChunk rows. */
  pending: { slug: string; type: string }[];
  pendingCount: number;
}

export type BakePendingResult = BakePendingReport | { available: false; reason: string };

/**
 * ContentEntry types that correspond to corpus folios. The studio also
 * hosts non-corpus kinds (codex research notes etc.) — those never bake
 * and must not appear as pending.
 */
export const CORPUS_ENTRY_TYPES = ['practice', 'archetype', 'pattern', 'research'] as const;

export function computeBakePending(input: {
  entries: BakePendingEntry[];
  corpusSlugs: string[];
}): BakePendingReport {
  const corpus = new Set(input.corpusSlugs);
  const published = input.entries.filter((e) => e.status === 'PUBLISHED');
  const pending = published
    .filter((e) => !corpus.has(e.slug))
    .map((e) => ({ slug: e.slug, type: e.type }));
  return {
    available: true,
    publishedEntries: published.length,
    corpusSlugs: input.corpusSlugs.length,
    pending,
    pendingCount: pending.length,
  };
}
