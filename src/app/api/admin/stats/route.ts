import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/api-auth";
import { getCorpusStats } from "@/lib/static-db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes((token.role as string) || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [
      totalUsers, activeStreaks, totalKeys, activeKeys, redeemedKeys,
      pendingConsultations, totalResolutions, draftContent, reviewContent,
    ] = await Promise.all([
      db.user.count(),
      db.sadhanaStreak.count({ where: { currentStreak: { gt: 0 } } }),
      db.inviteCode.count(),
      db.inviteCode.count({ where: { active: true } }),
      db.inviteUsage.count(),
      db.consultation.count({ where: { status: "NEW" } }),
      db.patternResolution.count({ where: { resolvedAt: { gte: new Date("1970-01-01T00:00:00Z") } } }),
      db.contentEntry.count({ where: { status: "DRAFT" } }),
      db.contentEntry.count({ where: { status: "IN_REVIEW" } }),
    ]);

    const tierDist = await db.user.groupBy({ by: ["tier"], _count: true });
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await db.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });
    const recognizedPatterns = await db.patternResolution.count();

    const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);
    const weeklySignups = await db.$queryRaw<Array<{ week: string; count: number }>>`
      SELECT date(createdAt) as week, COUNT(*) as count
      FROM User WHERE createdAt >= ${twelveWeeksAgo.toISOString()}
      GROUP BY date(createdAt) ORDER BY week ASC
    `;

    const consultStatuses = await db.consultation.groupBy({ by: ["status"], _count: true });

    let corpusStats: Awaited<ReturnType<typeof getCorpusStats>> | null = null;
    try { corpusStats = await getCorpusStats(); } catch {}

    return NextResponse.json({
      members: { total: totalUsers, new: newUsers, activeStreaks, tierDistribution: tierDist.map(t => ({ tier: t.tier, count: t._count })) },
      patterns: { recognized: recognizedPatterns, resolved: totalResolutions },
      keys: { total: totalKeys, active: activeKeys, redeemed: redeemedKeys, redemptionRate: totalKeys > 0 ? Math.round((redeemedKeys / totalKeys) * 100) : 0 },
      consultations: { pending: pendingConsultations, statusDistribution: consultStatuses.map(s => ({ status: s.status, count: s._count })) },
      content: { drafts: draftContent, inReview: reviewContent },
      charts: { weeklySignups },
      corpus: corpusStats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
