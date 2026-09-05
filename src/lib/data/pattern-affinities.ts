/**
 * PATTERN AFFINITIES — DB read model for folio pages (Vol. 2 #7).
 *
 * Pattern folios are static (generateStaticParams) + daily ISR
 * (revalidate = 86400): this query runs at build time and once a day
 * after, against the PatternPairAffinity cache the nightly digest
 * rewrites. Every failure degrades to [] — a folio with no data simply
 * renders no companions line, exactly the pre-feature behaviour. A build
 * without DB access must never fail because of a nice-to-have line.
 */

import { db } from '@/lib/db';

export interface PatternCompanion {
  slug: string;
  pairCount: number;
}

export async function getPatternCompanions(slug: string, limit = 3): Promise<PatternCompanion[]> {
  try {
    const rows = await db.patternPairAffinity.findMany({
      where: { OR: [{ slugA: slug }, { slugB: slug }] },
      orderBy: { pairCount: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({
      slug: r.slugA === slug ? r.slugB : r.slugA,
      pairCount: r.pairCount,
    }));
  } catch {
    return [];
  }
}
