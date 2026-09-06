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
// Cadence note: Vercel Cron is at-least-once — a missed run used to skip
// that Door for the list permanently (documented tradeoff). Vol. 3 #9
// replaces the tradeoff with ledger-driven catch-up: see the backfill
// block below (computeDueDoors / shouldSendCompletion + the guards that
// keep it safe). ==================================================

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

// ── Vol. 3 #9 — missed-Door backfill ────────────────────────────────────
// The old cron sent exactly door-N on day N: one skipped run permanently
// skipped that Door for the whole list (documented tradeoff at the top of
// this file). Now the EmailSend ledger IS the progression state: a Door is
// due if it is in the subscriber's window, unlogged, and under the caps.
//
// Guards, in order of importance:
//   · LOOKBACK WINDOW — doors older than BACKFILL_WINDOW_DAYS are treated
//     as historical. This is what makes backfill safe for subscribers who
//     predate EmailSend logging (their pre-ledger doors are invisible to
//     the sent-set and must never be re-sent).
//   · PER-SUBSCRIBER CAP — at most 2 catch-up emails per subscriber per
//     run. A fully-missed 3-day stretch takes two nightly runs to heal,
//     and no one ever wakes to a burst.
//   · GLOBAL BATCH CAP stays at the cron (150) — unchanged.

/** How many IST days back a Door remains deliverable. */
export const BACKFILL_WINDOW_DAYS = 3;

/** Max catch-up emails per subscriber per run. */
export const BACKFILL_PER_SUBSCRIBER_CAP = 2;

/**
 * Doors due RIGHT NOW for one subscriber: unlogged door days inside the
 * lookback window, oldest first, capped per run. On the healthy daily
 * path this returns exactly [today's door] — the normal behavior is
 * unchanged; only gaps trigger extra sends.
 */
export function computeDueDoors(
  day: number,
  sentDoorDays: Iterable<number>,
  opts: {
    windowDays?: number;
    perSubscriberCap?: number;
  } = {}
): number[] {
  const windowDays = opts.windowDays ?? BACKFILL_WINDOW_DAYS;
  const cap = opts.perSubscriberCap ?? BACKFILL_PER_SUBSCRIBER_CAP;
  const sent = new Set(sentDoorDays);
  const earliest = Math.max(1, day - windowDays + 1);
  const latest = Math.min(day, 10);
  const due: number[] = [];
  for (let d = earliest; d <= latest; d++) {
    if (sent.has(d)) continue;
    due.push(d);
    if (due.length >= cap) break;
  }
  return due;
}

/**
 * Completion catch-up: the day-11 completion email fires late (within the
 * window) if its run was missed, and only ever once — EmailSend is the
 * once-ever proof. Beyond the window it stays silent (historical).
 */
export function shouldSendCompletion(
  day: number,
  completionSent: boolean,
  windowDays: number = BACKFILL_WINDOW_DAYS
): boolean {
  return !completionSent && day >= 11 && day <= 11 + windowDays - 1;
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
