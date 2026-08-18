import { db } from './db';
import { getCorpusStats } from './static-db';
import { cache } from 'react';

/**
 * Cached stats fetcher using React `cache()`.
 * Deduplicates concurrent requests within a single render pass —
 * if multiple components or route handlers call this in the same
 * request, the DB queries run only once.
 *
 * Note: This is request-level deduplication (React cache), not
 * cross-request caching. For cross-request caching, wrap with
 * `unstable_cache` or add `"use cache"` directive when Next.js 16
 * stabilizes the API further.
 */
export const getCachedStats = cache(async () => {
  const [
    totalUsers, activeStreaks, totalKeys, activeKeys, redeemedKeys,
    pendingConsultations, totalResolutions, draftContent, reviewContent,
  ] = await Promise.all([
    db.user.count(),
    db.sadhanaStreak.count({ where: { currentStreak: { gt: 0 } } }),
    db.inviteCode.count(),
    db.inviteCode.count({ where: { active: true } }),
    db.inviteUsage.count(),
    db.consultation.count({ where: { status: 'NEW' } }),
    db.patternResolution.count({ where: { resolvedAt: { gte: new Date('1970-01-01T00:00:00Z') } } }),
    db.contentEntry.count({ where: { status: 'DRAFT' } }),
    db.contentEntry.count({ where: { status: 'IN_REVIEW' } }),
  ]);

  const tierDist = await db.user.groupBy({ by: ['tier'], _count: true });
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = await db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });
  const recognizedPatterns = await db.patternResolution.count();

  const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
  const weeklySignups = await db.$queryRaw<Array<{ week: string; count: number }>>`
    SELECT date(createdAt) as week, COUNT(*) as count
    FROM User WHERE createdAt >= ${twelveWeeksAgo.toISOString()}
    GROUP BY date(createdAt) ORDER BY week ASC
  `;

  const consultStatuses = await db.consultation.groupBy({ by: ['status'], _count: true });

  let corpusStats: Awaited<ReturnType<typeof getCorpusStats>> | null = null;
  try { corpusStats = await getCorpusStats(); } catch {}

  return {
    members: { total: totalUsers, new: newUsers, activeStreaks, tierDistribution: tierDist.map(t => ({ tier: t.tier, count: t._count })) },
    patterns: { recognized: recognizedPatterns, resolved: totalResolutions },
    keys: { total: totalKeys, active: activeKeys, redeemed: redeemedKeys, redemptionRate: totalKeys > 0 ? Math.round((redeemedKeys / totalKeys) * 100) : 0 },
    consultations: { pending: pendingConsultations, statusDistribution: consultStatuses.map(s => ({ status: s.status, count: s._count })) },
    content: { drafts: draftContent, inReview: reviewContent },
    charts: { weeklySignups },
    corpus: corpusStats,
  };
});
