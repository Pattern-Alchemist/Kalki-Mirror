import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { rateLimit } from "@/lib/admin/rate-limit";
import { redactUser } from "@/lib/privacy";

/* =============================================================
   GET /api/user/export — DPDP data-portability endpoint (Vol.3 #12)
   Session-gated, rate-limited (3/hour/user), audit-logged.
   Returns EVERYTHING the archive holds about the seeker as one
   JSON document; credential material is redacted at the source
   (redactUser), not filtered downstream.
   ============================================================= */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user
    ? (session.user as unknown as { id?: string }).id
    : undefined;
  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  // 3 exports per hour per user — the payload is heavy and the need is rare.
  const rl = rateLimit(`privacy-export:${userId}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Export rate limit reached. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tier: true,
        natalMoonLng: true,
        birthDate: true,
        birthPlace: true,
        latitude: true,
        longitude: true,
        timezone: true,
        lastTransmissionDate: true,
        invitedByCode: true,
        goldKeysRemaining: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          select: {
            plan: true,
            tier: true,
            status: true,
            utrRef: true,
            grantedAt: true,
            renewalCycle: true,
            nextDueAt: true,
            createdAt: true,
          },
        },
        streaks: {
          select: {
            practice: true,
            practiceName: true,
            currentStreak: true,
            longestStreak: true,
            totalDays: true,
            lastPracticedAt: true,
          },
        },
        resolutions: {
          select: {
            patternSlug: true,
            patternName: true,
            recognizedAt: true,
            resolvedAt: true,
            daysToResolve: true,
            notes: true,
          },
        },
      },
    });
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // Email-keyed records: the newsletter brain (EmailSubscriber) and its
    // event stream. The raw analytics ledger (Subscriber) is aggregated,
    // pseudonymous telemetry — only the subscriber's own rows are here.
    const [consultations, practiceSessions, subscriber, emailEvents] = await Promise.all([
      db.consultation.findMany({
        where: { OR: [{ userId }, { email: user.email }] },
        select: {
          name: true,
          email: true,
          request: true,
          status: true,
          scheduledFor: true,
          notes: true,
          patternDiagnosis: true,
          prescribedSequence: true,
          prescribedSiddhis: true,
          outcome: true,
          followUpDate: true,
          completedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.practiceSession.findMany({
        where: { userId },
        select: {
          siddhiSlug: true,
          siddhiName: true,
          durationMin: true,
          journal: true,
          moodBefore: true,
          moodAfter: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      db.emailSubscriber.findUnique({
        where: { email: user.email },
        select: {
          email: true,
          status: true,
          doorDay: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          landingPath: true,
          referrerDomain: true,
          createdAt: true,
        },
      }),
      db.emailEvent.findMany({
        where: { email: user.email },
        select: { type: true, url: true, occurredAt: true },
        orderBy: { occurredAt: "desc" },
        take: 500,
      }),
    ]);

    const payload = {
      $schema: "kalki.user-data-export/1",
      generatedAt: new Date().toISOString(),
      notice:
        "This document contains all personal data KALKI holds for this account. Authentication secrets are excluded by design.",
      profile: redactUser(user),
      consultations,
      practiceSessions,
      emailList: { subscription: subscriber, events: emailEvents },
    };

    await logAudit({
      action: "profile.data.export",
      entity: "User",
      entityId: userId,
      after: { consultations: consultations.length, practiceSessions: practiceSessions.length },
    });

    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="kalki-data-export-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[KALKI] user/export error:", err);
    return NextResponse.json(
      { error: "Export failed. Please try again." },
      { status: 500 }
    );
  }
}
