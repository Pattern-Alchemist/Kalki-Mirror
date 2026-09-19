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

    const [auditEvents, streaks, resolutions, keyUsages, consultations, memberships, testimonialsGiven] = await Promise.all([
      db.adminAuditLog.findMany({ where: { entityId: id }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.sadhanaStreak.findMany({ where: { userId: id }, orderBy: { updatedAt: "desc" }, take: 10, select: { practice: true, practiceName: true, currentStreak: true, longestStreak: true, updatedAt: true } }),
      db.patternResolution.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, patternSlug: true, patternName: true, resolvedAt: true, createdAt: true } }),
      // Schema fields: usedBy / usedAt / code (was userId / createdAt / inviteCode).
      db.inviteUsage.findMany({ where: { usedBy: id }, orderBy: { usedAt: "desc" }, take: 10, select: { id: true, code: true, usedAt: true } }),
      // Vol. 2 #15 — Seeker journey: consultations (by email or userId)
      db.consultation.findMany({
        where: { OR: [{ userId: id }, { email: user.email || '__none__' }] },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: { id: true, name: true, status: true, paymentState: true, outcome: true, createdAt: true, completedAt: true, aiTags: true },
      }),
      // Vol. 2 #15 — Memberships
      db.membership.findMany({
        where: { OR: [{ userId: id }, { email: user.email || '__none__' }] },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, plan: true, tier: true, status: true, utrRef: true, grantedAt: true, createdAt: true },
      }),
      // Vol. 2 #15 — Testimonials submitted by this user (matched by name+email heuristic)
      db.testimonial.findMany({
        where: { submittedBy: { contains: user.email || '__none__' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, quote: true, status: true, featured: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      user,
      timeline: {
        auditEvents,
        streaks,
        resolutions: resolutions.map((r) => ({
          ...r,
          status: r.resolvedAt ? ("RESOLVED" as const) : ("TRACKED" as const),
        })),
        keyUsages: keyUsages.map((k) => ({
          id: k.id,
          inviteCode: k.code,
          createdAt: k.usedAt,
        })),
      },
      // Vol. 2 #15 — Seeker journey: joined events across surfaces
      seekerJourney: {
        consultations: consultations.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          paymentState: c.paymentState,
          outcome: c.outcome,
          createdAt: c.createdAt,
          completedAt: c.completedAt,
          aiTags: c.aiTags,
        })),
        memberships: memberships.map(m => ({
          id: m.id,
          plan: m.plan,
          tier: m.tier,
          status: m.status,
          utrRef: m.utrRef,
          grantedAt: m.grantedAt,
          createdAt: m.createdAt,
        })),
        testimonials: testimonialsGiven.map(t => ({
          id: t.id,
          quote: t.quote,
          status: t.status,
          featured: t.featured,
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
