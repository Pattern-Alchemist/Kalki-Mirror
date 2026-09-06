// =============================================================
// KALKI — Ops cleanup (daily Vercel cron, Vol. 3 #19)
// -------------------------------------------------------------
// GET /api/cron/cleanup            → prune TTL'd rows, report counts
// GET /api/cron/cleanup?dryRun=1   → report what WOULD be pruned
//
// AUTH (mirrors /api/cron/course-send):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// WHY: four tables grow without bound on Turso and nothing pruned
// them — SynthesisCache.expiresAt was indexed but never enforced,
// ActiveSession rows outlive their 12h JWTs, EmailEvent keeps the
// raw signed webhook payload (~8KB/row) forever, and DISMISSED
// DraftLead rows are dead weight after 30 days. Unbounded growth on
// a free-tier DB is the quiet way platforms die.
//
// SCHEDULE: vercel.json cron "45 3 * * *" = 09:15 IST daily — after
// the digest (08:00 IST) so the digest reads a fresh last_cleanup_at.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// TTL policy (days) — generous; the point is "not forever", not "lean".
const SESSION_STALE_DAYS = 30;   // JWTs live 12h; 30d of lastSeen is plenty
const EMAIL_EVENT_DAYS = 180;    // dashboards look back weeks, not quarters
const DRAFT_DISMISS_DAYS = 30;   // dismissed leads older than a month

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // no secret configured → endpoint stays closed
  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { error: "unauthorized", hint: "Vercel cron bearer token or ?key=<CRON_SECRET>" },
      { status: 401 },
    );
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const now = Date.now();
  const sessionCutoff = new Date(now - SESSION_STALE_DAYS * 86_400_000);
  const eventCutoff = new Date(now - EMAIL_EVENT_DAYS * 86_400_000);
  const draftCutoff = new Date(now - DRAFT_DISMISS_DAYS * 86_400_000);

  try {
    // 1. SynthesisCache — enforce the contract the schema already declares.
    const synthesisPruned = await db.synthesisCache.deleteMany({
      where: { expiresAt: { lt: new Date(now) } },
    }).then(r => r.count);

    // 2. ActiveSession — rows whose 12h JWT is long dead.
    const sessionsPruned = await db.activeSession.deleteMany({
      where: { lastSeen: { lt: sessionCutoff } },
    }).then(r => r.count);

    // 3. EmailEvent — raw webhook payloads are forensics, not archives.
    const eventsPruned = await db.emailEvent.deleteMany({
      where: { occurredAt: { lt: eventCutoff } },
    }).then(r => r.count);

    // 4. DraftLead — DISMISSED drafts past their grace.
    const draftsPruned = await db.draftLead.deleteMany({
      where: { status: "DISMISSED", updatedAt: { lt: draftCutoff } },
    }).then(r => r.count);

    if (!dryRun) {
      await db.opsState.upsert({
        where: { key: "last_cleanup_at" },
        update: { value: new Date(now).toISOString() },
        create: { key: "last_cleanup_at", value: new Date(now).toISOString() },
      });
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      pruned: {
        synthesisCache: synthesisPruned,
        activeSessions: sessionsPruned,
        emailEvents: eventsPruned,
        dismissedDraftLeads: draftsPruned,
      },
      cutoffs: {
        sessions: sessionCutoff.toISOString(),
        emailEvents: eventCutoff.toISOString(),
        dismissedDrafts: draftCutoff.toISOString(),
      },
    });
  } catch (error) {
    console.error("[cleanup] failed:", error);
    return NextResponse.json(
      { ok: false, error: "cleanup failed", detail: String(error).slice(0, 200) },
      { status: 500 },
    );
  }
}
