"use server";

import { db } from "@/lib/db";

export async function getOverviewStats() {
  const [
    totalUsers,
    activeStreaks,
    totalKeys,
    activeKeys,
    redeemedKeys,
    pendingConsultations,
    totalResolutions,
    draftContent,
    reviewContent,
  ] = await Promise.all([
    db.user.count(),
    db.sadhanaStreak.count({ where: { currentStreak: { gt: 0 } } }),
    db.inviteCode.count(),
    db.inviteCode.count({ where: { active: true } }),
    db.inviteUsage.count(),
    db.consultation.count({ where: { status: "NEW" } }),
    db.patternResolution.count({ where: { resolvedAt: { not: null } } }),
    db.contentEntry.count({ where: { status: "DRAFT" } }),
    db.contentEntry.count({ where: { status: "IN_REVIEW" } }),
  ]);

  // Tier distribution
  const tierDist = await db.user.groupBy({
    by: ["tier"],
    _count: true,
  });

  // Recent users (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newUsers = await db.user.count({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  // Pattern journey: recognized vs resolved
  const recognizedPatterns = await db.patternResolution.count();

  return {
    members: {
      total: totalUsers,
      new: newUsers,
      activeStreaks,
      tierDistribution: tierDist.map((t) => ({
        tier: t.tier,
        count: t._count,
      })),
    },
    patterns: {
      recognized: recognizedPatterns,
      resolved: totalResolutions,
    },
    keys: {
      total: totalKeys,
      active: activeKeys,
      redeemed: redeemedKeys,
      redemptionRate:
        totalKeys > 0 ? Math.round((redeemedKeys / totalKeys) * 100) : 0,
    },
    consultations: {
      pending: pendingConsultations,
    },
    content: {
      drafts: draftContent,
      inReview: reviewContent,
    },
  };
}
