import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await authenticateRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      include: {
        streaks: { orderBy: { lastPracticedAt: "desc" } },
        resolutions: { orderBy: { resolvedAt: "desc" } },
        keysGenerated: { orderBy: { createdAt: "desc" }, include: { _count: { select: { usages: true } } } },
        keysUsed: { orderBy: { usedAt: "desc" }, include: { code: { select: { code: true } } } },
      },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [auditEvents, streaks, resolutions, keyUsages] = await Promise.all([
      db.adminAuditLog.findMany({ where: { entityId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.sadhanaStreak.findMany({ where: { userId: id }, orderBy: { updatedAt: "desc" }, take: 10, select: { practice: true, practiceName: true, currentStreak: true, longestStreak: true, updatedAt: true } }),
      db.patternResolution.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, patternSlug: true, status: true, createdAt: true } }),
      db.inviteUsage.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, inviteCode: true, createdAt: true } }),
    ]);

    return NextResponse.json({ user, timeline: { auditEvents, streaks, resolutions, keyUsages } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
