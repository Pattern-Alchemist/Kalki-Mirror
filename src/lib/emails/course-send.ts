// =============================================================
// KALKI — 10 Doors: send orchestration
// -------------------------------------------------------------
// Stateless course progression, per doors-email-course.md §7:
// "computes their current day by createdAt" — no schema changes,
// no send-state table. The cron fires once daily at 20:00 IST
// (the publishing hour):
//
//   course day 0      → welcome already sent immediately at subscribe
//   course day 1–10   → that day's Door (fixed order, doc §4)
//   course day 11     → completion email (doc §5)
//   course day > 11   → course finished, silent
//
// Cadence note: Vercel Cron is at-least-once — a missed run skips
// that Door for the list (documented tradeoff; list stays healthy,
// no duplicate risk within a day under single daily invocation).
// =============================================================

import { sendEmail, type SendEmailResult } from "@/lib/resend";
import {
  buildCompletion,
  buildDoorDay,
  buildWelcome,
} from "@/lib/emails/course-content";
import { db } from "@/lib/db";

/** Fixed +05:30 — the course is scheduled in IST regardless of subscriber geo (doc §1). */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole IST calendar days elapsed since subscribe (0 = today). */
export function computeCourseDay(createdAt: Date, now: Date = new Date()): number {
  const a = Math.floor((createdAt.getTime() + IST_OFFSET_MS) / DAY_MS);
  const b = Math.floor((now.getTime() + IST_OFFSET_MS) / DAY_MS);
  return b - a;
}

export const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "admin@astrokalki.com";

/**
 * Persist an accepted send (Resend returned an email id) into EmailSend —
 * the anchor the webhook events correlate against (Tier 2 #10). Soft-fail:
 * a logging outage must never break a live email delivery.
 */
async function logSend(
  to: string,
  kind: "welcome" | "door" | "completion",
  doorDay: number | null,
  subject: string,
  res: SendEmailResult,
): Promise<void> {
  if (!res.ok || !res.id) return;
  try {
    await db.emailSend.create({
      data: { emailId: res.id, email: to.toLowerCase(), kind, doorDay, subject },
    });
  } catch (err) {
    console.error("[email-log] EmailSend write failed", to, kind, err);
  }
}

/** Welcome email — invoked via `after()` in the subscribe route (new subscribers only). */
export async function sendWelcome(to: string) {
  const e = buildWelcome(to);
  const res = await sendEmail({
    to,
    subject: e.subject,
    html: e.html,
    text: e.text,
    headers: e.headers,
    replyTo: REPLY_TO,
  });
  await logSend(to, "welcome", null, e.subject, res);
  return res;
}

/** Day 1–10 Door email. Returns skipped result for out-of-range days. */
export async function sendDoorDay(to: string, day: number) {
  const e = buildDoorDay(day, to);
  if (!e) return { ok: false, skipped: true, error: `no door for day ${day}` } as SendEmailResult;
  const res = await sendEmail({
    to,
    subject: e.subject,
    html: e.html,
    text: e.text,
    headers: e.headers,
    replyTo: REPLY_TO,
  });
  await logSend(to, "door", day, e.subject, res);
  return res;
}

/** Day-11 completion email (doc §5). */
export async function sendCompletion(to: string) {
  const e = buildCompletion(to);
  const res = await sendEmail({
    to,
    subject: e.subject,
    html: e.html,
    text: e.text,
    headers: e.headers,
    replyTo: REPLY_TO,
  });
  await logSend(to, "completion", null, e.subject, res);
  return res;
}
