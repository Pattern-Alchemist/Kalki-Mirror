"use server";

import { db } from "@/lib/db";
import { safeGetToken } from "@/lib/get-token-safe";
import { logAudit } from "@/lib/admin/audit";
import { sendEmail } from "@/lib/resend";
import { REPLY_TO } from "@/lib/emails/course-send";
import { buildBroadcast, letterSlug } from "@/lib/emails/broadcast-content";
import { buildWinbackEmail } from "@/lib/emails/winback";
import {
  reduceWinbackSegment,
  WINBACK_KIND,
  WINBACK_OPEN_WINDOW_DAYS,
  WINBACK_SUPPRESSION_DAYS,
} from "@/lib/admin/winback";
import { createRateLimiter } from "@/lib/rate-limit";

/* ════════════════════════════════════════════════════════════════════
   VOL. 3 #6 — Broadcast compose + send
   The Doors list has been warm and mute: the only admin list tool was
   export CSV. This module is the compose → preview → send path, with
   dry-run as the DEFAULT (the action refuses to send without an explicit
   confirm flag), a per-run batch cap that stays inside provider limits,
   the EmailSend ledger (kind "ops") anchoring every accepted send, and
   an audit entry per dispatch.
   ════════════════════════════════════════════════════════════════════ */

async function requireAdmin() {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const role = session.role as string;
  if (!["ADMIN", "SUPERADMIN"].includes(role)) {
    throw new Error("Forbidden — broadcast requires ADMIN");
  }
  return session.id;
}

/** Per-run send cap — one invocation never floods the provider. */
const BROADCAST_CAP = Math.max(1, Math.min(500, Number(process.env.BROADCAST_BATCH_CAP) || 100));

/** Dispatch rate limit: 3 sends per hour per admin — broadcasts are rare and deliberate. */
const broadcastLimiter = createRateLimiter({ max: 3, window: 3600, prefix: "broadcast" });

type DispatchResult = { sent: number; failed: number };

/**
 * Shared dispatch loop (Vol. 4 #4 refactor) — build per recipient, send,
 * ledger with the given kind. Soft-fail per recipient and per ledger
 * write: an outage must never break a live delivery mid-batch.
 */
async function dispatchBatch(opts: {
  recipients: string[];
  subject: string;
  body: string;
  kind: string;
}): Promise<DispatchResult> {
  let sent = 0;
  let failed = 0;
  for (const email of opts.recipients) {
    try {
      const built = buildBroadcast(opts.subject, opts.body, email);
      const res = await sendEmail({
        to: email,
        subject: opts.subject,
        html: built.html,
        text: built.text,
        headers: built.headers,
        replyTo: REPLY_TO,
      });
      if (res.ok) {
        sent += 1;
        // EmailSend ledger — the webhook anchor. Soft-fail: a logging
        // outage must never break a live delivery.
        if (res.id) {
          try {
            await db.emailSend.create({
              data: {
                emailId: res.id,
                email: email.toLowerCase(),
                kind: opts.kind,
                doorDay: null,
                subject: opts.subject,
              },
            });
          } catch (err) {
            console.error("[broadcast] EmailSend write failed", email, err);
          }
        }
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }
  return { sent, failed };
}

export type BroadcastPreview = {
  count: number;
  sample: string[];
  html: string;
  text: string;
  cap: number;
};

export async function getBroadcastAudience(): Promise<{ count: number; cap: number }> {
  await requireAdmin();
  const count = await db.emailSubscriber.count({ where: { status: "active" } });
  return { count, cap: BROADCAST_CAP };
}

export async function previewBroadcast(subject: string, body: string): Promise<BroadcastPreview> {
  await requireAdmin();

  const s = subject.trim();
  const b = body.trim();
  if (s.length < 3 || s.length > 200) throw new Error("Subject must be 3–200 characters");
  if (b.length < 20 || b.length > 20_000) throw new Error("Body must be 20–20,000 characters");

  const recipients = await db.emailSubscriber.findMany({
    where: { status: "active" },
    select: { email: true },
    orderBy: { createdAt: "asc" },
    take: 2000,
  });

  // Preview renders for the FIRST would-be recipient (cap-bounded list).
  const first = recipients[0]?.email ?? "reader@astrokalki.com";
  const built = buildBroadcast(s, b, first);

  return {
    count: recipients.length,
    sample: recipients.slice(0, 5).map((r) => r.email),
    html: built.html,
    text: built.text,
    cap: BROADCAST_CAP,
  };
}

export type BroadcastSendResult = {
  needsConfirm: boolean;
  sent: number;
  failed: number;
  remaining: number;
  total: number;
  subject: string;
};

export async function sendBroadcast(
  subject: string,
  body: string,
  confirmed: boolean
): Promise<BroadcastSendResult> {
  const adminId = await requireAdmin();

  const { limited } = await broadcastLimiter(`broadcast:${adminId}`);
  if (limited) throw new Error("Rate limited — three broadcasts per hour, then rest");

  const s = subject.trim();
  const b = body.trim();
  if (s.length < 3 || s.length > 200) throw new Error("Subject must be 3–200 characters");
  if (b.length < 20 || b.length > 20_000) throw new Error("Body must be 20–20,000 characters");

  const recipients = await db.emailSubscriber.findMany({
    where: { status: "active" },
    select: { email: true },
    orderBy: { createdAt: "asc" },
    take: 2000,
  });
  const total = recipients.length;
  const batch = recipients.slice(0, BROADCAST_CAP);
  const remaining = Math.max(0, total - batch.length);

  // DRY-RUN DEFAULT — the action refuses to send without the explicit
  // confirm flag; the UI drives the two-step (preview → confirm) flow.
  if (!confirmed) {
    return { needsConfirm: true, sent: 0, failed: 0, remaining: total, total, subject: s };
  }

  const { sent, failed } = await dispatchBatch({
    recipients: batch.map((r) => r.email),
    subject: s,
    body: b,
    kind: "ops",
  });

  // Vol. 4 #7 — capture the letter for the public archive (/letters).
  // The RAW composed body is stored — never the per-recipient build,
  // which carries signed per-subscriber unsubscribe URLs. One row per
  // confirmed dispatch (a cap-overflow re-run is a second, honest row).
  // Soft-fail: an archive outage must never break a live delivery.
  try {
    const salt = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await db.letter.create({
      data: {
        slug: letterSlug(s, salt),
        subject: s,
        body: b,
        recipientCount: sent,
        isPublic: true,
      },
    });
  } catch (err) {
    console.error("[broadcast] Letter archive write failed", err);
  }

  await logAudit({
    action: "email.broadcast",
    entity: "EmailSend",
    entityId: s.slice(0, 80),
    after: { subject: s, total, sent, failed, remaining, cap: BROADCAST_CAP },
  }).catch(() => {});

  return { needsConfirm: false, sent, failed, remaining, total, subject: s };
}

/* ═════════════════════════════════════════════════════════════════════
   VOL. 4 #4 — Win-back for the silently cold
   Active subscribers, on the list ≥ 21 days, zero opens in 21 days.
   Same compose → preview → confirm discipline as the main broadcast,
   three differences: the audience is the COLD segment (re-gathered at
   send time — the preview's numbers are never trusted with a send),
   suppression (≤1 per 30d) is enforced in THIS path via the segment
   rules, and the ledger rows carry kind "winback" so the next run —
   and the suppression check — can see them.
   ═════════════════════════════════════════════════════════════════════ */

/**
 * Gather + reduce the cold segment. The PURE rules live in
 * lib/admin/winback.ts; this only feeds them bounded reads.
 */
async function gatherColdSegment(): Promise<{ cold: string[]; suppressed: number }> {
  const now = new Date();
  const sinceOpens = new Date(now.getTime() - WINBACK_OPEN_WINDOW_DAYS * 86_400_000);
  const sinceWinback = new Date(now.getTime() - WINBACK_SUPPRESSION_DAYS * 86_400_000);
  const [candidates, opens, winbacks] = await Promise.all([
    db.emailSubscriber.findMany({
      where: { status: "active" },
      select: { email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 2000,
    }),
    db.emailEvent.findMany({
      where: { type: "email.opened", occurredAt: { gte: sinceOpens } },
      select: { email: true },
      take: 20_000,
    }),
    db.emailSend.findMany({
      where: { kind: WINBACK_KIND, sentAt: { gte: sinceWinback } },
      select: { email: true },
      take: 5_000,
    }),
  ]);
  return reduceWinbackSegment({
    now,
    candidates: candidates.map((c) => ({ email: c.email, createdAt: c.createdAt.toISOString() })),
    opensInWindow: opens,
    winbacksInWindow: winbacks,
  });
}

export type WinbackAudience = {
  count: number;
  /** cold by opens but already win-backed inside the suppression window */
  suppressed: number;
  cap: number;
  template: { subject: string; body: string };
};

export async function getWinbackAudience(): Promise<WinbackAudience> {
  await requireAdmin();
  const { cold, suppressed } = await gatherColdSegment();
  return { count: cold.length, suppressed, cap: BROADCAST_CAP, template: buildWinbackEmail() };
}

export async function previewWinback(subject: string, body: string): Promise<BroadcastPreview> {
  await requireAdmin();

  const s = subject.trim();
  const b = body.trim();
  if (s.length < 3 || s.length > 200) throw new Error("Subject must be 3–200 characters");
  if (b.length < 20 || b.length > 20_000) throw new Error("Body must be 20–20,000 characters");

  const { cold } = await gatherColdSegment();
  const first = cold[0] ?? "reader@astrokalki.com";
  const built = buildBroadcast(s, b, first);

  return {
    count: cold.length,
    sample: cold.slice(0, 5),
    html: built.html,
    text: built.text,
    cap: BROADCAST_CAP,
  };
}

export async function sendWinback(
  subject: string,
  body: string,
  confirmed: boolean
): Promise<BroadcastSendResult> {
  const adminId = await requireAdmin();

  const { limited } = await broadcastLimiter(`broadcast:${adminId}`);
  if (limited) throw new Error("Rate limited — three broadcasts per hour, then rest");

  const s = subject.trim();
  const b = body.trim();
  if (s.length < 3 || s.length > 200) throw new Error("Subject must be 3–200 characters");
  if (b.length < 20 || b.length > 20_000) throw new Error("Body must be 20–20,000 characters");

  // AUTHORITATIVE GATHER — the segment (with its suppression rules) is
  // re-derived at dispatch time. A stale preview can never widen the send.
  const { cold } = await gatherColdSegment();
  const total = cold.length;
  const batch = cold.slice(0, BROADCAST_CAP);
  const remaining = Math.max(0, total - batch.length);

  // DRY-RUN DEFAULT — identical contract to sendBroadcast.
  if (!confirmed) {
    return { needsConfirm: true, sent: 0, failed: 0, remaining: total, total, subject: s };
  }

  const { sent, failed } = await dispatchBatch({ recipients: batch, subject: s, body: b, kind: WINBACK_KIND });

  // Letter archive — the win-back letter is a letter like any other:
  // raw body only (no per-recipient build, no personal data), soft-fail.
  try {
    const salt = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    await db.letter.create({
      data: {
        slug: letterSlug(s, salt),
        subject: s,
        body: b,
        recipientCount: sent,
        isPublic: true,
      },
    });
  } catch (err) {
    console.error("[winback] Letter archive write failed", err);
  }

  await logAudit({
    action: "email.winback",
    entity: "EmailSend",
    entityId: s.slice(0, 80),
    after: { subject: s, segment: "active ≥21d, zero opens 21d, unsuppressed", total, sent, failed, remaining, cap: BROADCAST_CAP },
  }).catch(() => {});

  return { needsConfirm: false, sent, failed, remaining, total, subject: s };
}
