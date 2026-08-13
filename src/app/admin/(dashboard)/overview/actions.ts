"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = (session.user as unknown as { role: string }).role;
  if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes(role)) {
    throw new Error("Forbidden");
  }
}

export async function getOverviewStats() {
  await requireAdmin();
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
    db.patternResolution.count({ where: { resolvedAt: { not: null as never } } }),
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

  // A9: Signup trends (last 12 weeks)
  const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
  const weeklySignups = await db.$queryRaw<Array<{ week: string; count: number }>>`
    SELECT
      date(createdAt) as week,
      COUNT(*) as count
    FROM User
    WHERE createdAt >= ${twelveWeeksAgo.toISOString()}
    GROUP BY date(createdAt)
    ORDER BY week ASC
  `;

  // Consultation status distribution
  const consultStatuses = await db.consultation.groupBy({
    by: ["status"],
    _count: true,
  });

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
      statusDistribution: consultStatuses.map(s => ({
        status: s.status,
        count: s._count,
      })),
    },
    content: {
      drafts: draftContent,
      inReview: reviewContent,
    },
    // A9: Chart data
    charts: {
      weeklySignups,
    },
  };
}