"use server";

import { db } from "@/lib/db";
import { safeGetToken } from "@/lib/get-token-safe";
import { logAudit } from "@/lib/admin/audit";
import { sendEmail } from "@/lib/resend";
import { REPLY_TO } from "@/lib/emails/course-send";
import { buildBroadcast } from "@/lib/emails/broadcast-content";
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

  let sent = 0;
  let failed = 0;
  for (const { email } of batch) {
    try {
      const built = buildBroadcast(s, b, email);
      const res = await sendEmail({
        to: email,
        subject: s,
        html: built.html,
        text: built.text,
        headers: built.headers,
        replyTo: REPLY_TO,
      });
      if (res.ok) {
        sent += 1;
        // EmailSend ledger (kind "ops") — the webhook anchor. Soft-fail:
        // a logging outage must never break a live delivery.
        if (res.id) {
          try {
            await db.emailSend.create({
              data: { emailId: res.id, email: email.toLowerCase(), kind: "ops", doorDay: null, subject: s },
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

  await logAudit({
    action: "email.broadcast",
    entity: "EmailSend",
    entityId: s.slice(0, 80),
    after: { subject: s, total, sent, failed, remaining, cap: BROADCAST_CAP },
  }).catch(() => {});

  return { needsConfirm: false, sent, failed, remaining, total, subject: s };
}
