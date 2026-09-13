/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Seeker weekly digest engine (Vol. 6 #13)
   ---------------------------------------------------------------------------
   Gathers the week's new letters + a spotlight pick, sends one email per
   active subscriber. Rides the course-send rail (same sendEmail + EmailSend
   ledger). Single-opt-in posture untouched.

   OpsState key 'weekly_digest:last_sent' records the last send timestamp
   (idempotence: re-running the cron on the same Monday does not re-send).

   Static-arrays dead-end: glossary/patterns/siddhis have no per-entry
   addedAt date. The weekly digest reports ONLY letters (which have sentAt).
   The canonical-count delta is a future item (requires a snapshot diff).
   ═══════════════════════════════════════════════════════════════════════════ */

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import {
  buildWeeklyDigestEmail,
  excerptBody,
  type WeeklyDigestContent,
  type WeeklyDigestLetterPreview,
} from '@/lib/emails/weekly-digest';

const WEEKLY_DIGEST_OPS_KEY = 'weekly_digest:last_sent';
const BATCH_CAP = 200; // per-run cap (hobby serverless budget)
const EMAIL_KIND = 'weekly';

export { WEEKLY_DIGEST_OPS_KEY };

/**
 * Gather the week's content: new letters published in the last 7 days,
 * + a spotlight (the most-clicked letter of the week, falling back to
 * the newest if no clicks recorded).
 */
export async function gatherWeeklyContent(now: Date = new Date()): Promise<WeeklyDigestContent> {
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);

  // 1. Letters published this week
  const newLetters = await db.letter.findMany({
    where: { isPublic: true, sentAt: { gte: weekAgo } },
    orderBy: { sentAt: 'desc' },
    take: 5,
    select: { slug: true, subject: true, body: true, sentAt: true },
  });

  const previews: WeeklyDigestLetterPreview[] = newLetters.map((l) => ({
    slug: l.slug,
    subject: l.subject,
    bodyExcerpt: excerptBody(l.body),
    sentAt: l.sentAt.toISOString(),
  }));

  // 2. Spotlight — the most-clicked letter of the week (from EmailEvent clicks)
  let spotlight: WeeklyDigestLetterPreview | null = previews[0] ?? null;
  try {
    const clicked = await db.emailEvent.findMany({
      where: {
        type: 'email.clicked',
        url: { contains: '/letters/' },
        occurredAt: { gte: weekAgo },
      },
      select: { url: true },
    });
    if (clicked.length > 0) {
      const counts = new Map<string, number>();
      for (const e of clicked) {
        const slug = e.url?.split('/letters/')[1]?.split(/[?#]/)[0];
        if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
      }
      const topSlug = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topSlug) {
        const topLetter = await db.letter.findUnique({
          where: { slug: topSlug },
          select: { slug: true, subject: true, body: true, sentAt: true },
        });
        if (topLetter) {
          spotlight = {
            slug: topLetter.slug,
            subject: topLetter.subject,
            bodyExcerpt: excerptBody(topLetter.body),
            sentAt: topLetter.sentAt.toISOString(),
          };
        }
      }
    }
  } catch {
    // click tracking transient — spotlight falls back to newest
  }

  return {
    newLetters: previews,
    spotlight,
    weekStart: weekAgo.toISOString(),
  };
}

/** Read the last-send OpsState marker (idempotence check). */
export async function getLastSentTimestamp(): Promise<string | null> {
  try {
    const row = await db.opsState.findUnique({ where: { key: WEEKLY_DIGEST_OPS_KEY } });
    return row?.value ?? null;
  } catch {
    return null;
  }
}

/** Write the last-send OpsState marker. */
export async function setLastSentTimestamp(ts: string): Promise<void> {
  try {
    await db.opsState.upsert({
      where: { key: WEEKLY_DIGEST_OPS_KEY },
      create: { key: WEEKLY_DIGEST_OPS_KEY, value: ts },
      update: { value: ts },
    });
  } catch {
    // OpsState write is a convenience, never a dependency
  }
}

export interface WeeklyDigestSendResult {
  ok: boolean;
  recipientCount: number;
  sent: number;
  failed: number;
  letterCount: number;
  spotlight: string | null;
  skipped?: 'already_sent_today' | 'no_content';
  error?: string;
}

/**
 * Run the weekly digest: gather content, send to all active subscribers,
 * stamp the OpsState marker. Idempotent: if already sent today, skips.
 */
export async function runWeeklyDigest(opts: {
  dryRun?: boolean;
  now?: Date;
  siteUrl?: string;
}): Promise<WeeklyDigestSendResult> {
  const now = opts.now ?? new Date();
  const siteUrl = opts.siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.astrokalki.com';

  // 1. Idempotence: check if already sent today
  const lastSent = await getLastSentTimestamp();
  if (lastSent) {
    const lastSentDate = new Date(lastSent);
    const hoursSince = (now.getTime() - lastSentDate.getTime()) / 3_600_000;
    if (hoursSince < 20) {
      return {
        ok: true,
        recipientCount: 0,
        sent: 0,
        failed: 0,
        letterCount: 0,
        spotlight: null,
        skipped: 'already_sent_today',
      };
    }
  }

  // 2. Gather content
  const content = await gatherWeeklyContent(now);

  if (content.newLetters.length === 0 && !content.spotlight) {
    // No content this week — still stamp the marker so we don't re-check
    if (!opts.dryRun) await setLastSentTimestamp(now.toISOString());
    return {
      ok: true,
      recipientCount: 0,
      sent: 0,
      failed: 0,
      letterCount: 0,
      spotlight: null,
      skipped: 'no_content',
    };
  }

  // 3. Gather recipients (active subscribers)
  const subscribers = await db.emailSubscriber.findMany({
    where: { status: 'active' },
    select: { email: true },
    orderBy: { createdAt: 'asc' },
    take: BATCH_CAP,
  });

  if (opts.dryRun) {
    return {
      ok: true,
      recipientCount: subscribers.length,
      sent: 0,
      failed: 0,
      letterCount: content.newLetters.length,
      spotlight: content.spotlight?.slug ?? null,
    };
  }

  // 4. Send (loop, fail-soft per recipient)
  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    try {
      const email = buildWeeklyDigestEmail({
        email: sub.email,
        content,
        siteUrl,
      });
      const res = await sendEmail({
        to: sub.email,
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      if (res.ok) {
        sent += 1;
        // Log to EmailSend ledger (soft-fail)
        try {
          await db.emailSend.create({
            data: {
              emailId: res.id ?? `weekly-${Date.now()}-${sub.email}`,
              email: sub.email.toLowerCase(),
              kind: EMAIL_KIND,
              subject: email.subject,
            },
          });
        } catch {
          // ledger write failure never blocks the send
        }
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
  }

  // 5. Stamp the OpsState marker
  await setLastSentTimestamp(now.toISOString());

  return {
    ok: true,
    recipientCount: subscribers.length,
    sent,
    failed,
    letterCount: content.newLetters.length,
    spotlight: content.spotlight?.slug ?? null,
  };
}
