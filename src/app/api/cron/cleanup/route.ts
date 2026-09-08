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
//
// VOL. 4 #8 — the route also carries the scheduled-publish FLIP PASS:
// PUBLISHED entries whose scheduled publishedAt has come due get their
// publish side effects (webhook + notification + sitemap refresh)
// exactly once. Visibility itself needs no cron — the public gate hides
// future-publishedAt rows continuously — the flip pass only settles the
// ANNOUNCEMENT. Idempotence = audit pair (content.schedule written at
// scheduling, content.publish_flip written at the flip); see
// src/lib/admin/scheduled-publish.ts.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withCronLedger } from "@/lib/cron-ledger";

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

  // Vol. 5 #4 — the ledger observes the run; its rethrow maps to the
  // pre-existing 500 contract below. DryRun runs are recorded too (a
  // successful probe is evidence the cron works).
  try {
    const { result } = await withCronLedger("cleanup", async () => {
      const inner = await runCleanupBody(dryRun, now, sessionCutoff, eventCutoff, draftCutoff);
      return { response: inner.response, items: inner.items };
    });
    return result.response;
  } catch (error) {
    console.error("[cleanup] failed:", error);
    return NextResponse.json(
      { ok: false, error: "cleanup failed", detail: String(error).slice(0, 200) },
      { status: 500 },
    );
  }
}

async function runCleanupBody(
  dryRun: boolean,
  now: number,
  sessionCutoff: Date,
  eventCutoff: Date,
  draftCutoff: Date
): Promise<{ response: NextResponse; items: number }> {
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

    // 5. Scheduled-publish flip pass (Vol. 4 #8) — fire publish side
    //     effects for due scheduled entries, exactly once. Fail-soft:
    //     a flip-pass hiccup must never fail the whole cleanup.
    let scheduledPublishFlips = 0;
    let flipDetail: Array<{ slug: string; publishAt: string }> = [];
    let flipError: string | null = null;
    try {
      const { planPublishFlips, scheduleAuditPayload } = await import(
        "@/lib/admin/scheduled-publish"
      );
      const dueRows = await db.contentEntry.findMany({
        where: {
          status: "PUBLISHED",
          publishedAt: { lte: new Date(now) },
        },
        select: { id: true, title: true, type: true, slug: true, publishedAt: true },
      });
      const audits =
        dueRows.length > 0
          ? await db.adminAuditLog.findMany({
              where: {
                action: { in: ["content.schedule", "content.publish_flip"] },
                entity: "ContentEntry",
                entityId: { in: dueRows.map((r) => r.id) },
              },
              select: { action: true, entityId: true, after: true },
            })
          : [];
      const plan = planPublishFlips(dueRows, audits, new Date(now));
      for (const entry of plan) {
        // Settle the flip audit FIRST — a crash after this line costs a
        // missed announcement, never a double announcement.
        await db.adminAuditLog.create({
          data: {
            actorId: "system:cron",
            action: "content.publish_flip",
            entity: "ContentEntry",
            entityId: entry.id,
            after: JSON.stringify(scheduleAuditPayload(entry.publishedAt)),
            ipHash: null,
          },
        });
        scheduledPublishFlips++;
        flipDetail.push({ slug: entry.slug ?? entry.id, publishAt: entry.publishedAt.toISOString() });
        // Side effects fail-soft, each in its own skin.
        try {
          const { dispatchWebhooks } = await import("@/lib/admin/webhook-dispatch");
          await dispatchWebhooks("content.published", {
            id: entry.id,
            title: entry.title,
            type: entry.type,
          });
        } catch {
          // webhook outage never blocks the pass
        }
        try {
          const { broadcastNotification } = await import("@/lib/admin/notifications");
          await broadcastNotification({
            title: "Scheduled content is live",
            body: `"${entry.title}" reached its publish time and is now public`,
            type: "success",
            href: "/admin/content",
          });
        } catch {
          // notification failure never blocks the pass
        }
      }
      if (plan.length > 0) {
        // The entry set changed publicly — refresh the sitemap now.
        revalidatePath("/sitemap.xml");
      }
    } catch (error) {
      flipError = String(error).slice(0, 200);
    }

    if (!dryRun) {
      await db.opsState.upsert({
        where: { key: "last_cleanup_at" },
        update: { value: new Date(now).toISOString() },
        create: { key: "last_cleanup_at", value: new Date(now).toISOString() },
      });
    }

    const items = synthesisPruned + sessionsPruned + eventsPruned + draftsPruned + scheduledPublishFlips;
    return {
      response: NextResponse.json({
      ok: true,
      dryRun,
      pruned: {
        synthesisCache: synthesisPruned,
        activeSessions: sessionsPruned,
        emailEvents: eventsPruned,
        dismissedDraftLeads: draftsPruned,
      },
      scheduledPublish: {
        flips: scheduledPublishFlips,
        detail: dryRun ? flipDetail : undefined,
        error: flipError,
      },
      cutoffs: {
        sessions: sessionCutoff.toISOString(),
        emailEvents: eventCutoff.toISOString(),
        dismissedDrafts: draftCutoff.toISOString(),
      },
    }),
      items,
    };
  } catch (error) {
    console.error("[cleanup] body failed:", error);
    throw error; // the ledger records the error; the caller maps to 500
  }
}
