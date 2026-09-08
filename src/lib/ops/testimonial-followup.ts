/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Testimonial follow-up engine (Vol. 5 #14)
   ---------------------------------------------------------------------------
   Connects the three surfaces the flywheel needs to become a loop:
     · the COMPLETED consultation (completedAt stamped by the outcome writer)
     · the seeker's self-intake form (/profile#testimonial, Vol. 4 #5)
     · the archivist's approval queue (/admin/testimonials)
   Nothing connected them — the wall stayed empty because nobody was asked.

   Two senders share this module:
     · the daily cron (t+14d after completedAt, once per consultation)
     · the archivist's nudge button (immediate, upserts the ledger row)

   The ledger table self-heals on the remote store (the CronRun pattern —
   the server env holds the working token; dev/file stores get their table
   from db push / the test provision). Fail-soft everywhere: an email or
   ledger outage degrades the loop, never breaks the caller.
   ═══════════════════════════════════════════════════════════════════════════ */

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/resend";
import { logAudit } from "@/lib/admin/audit";
import { buildTestimonialFollowUpEmail } from "@/lib/emails/testimonial-followup";

// ── self-healing table (CronRun pattern) ────────────────────────────────────

const TESTIMONIAL_FOLLOWUP_DDL = [
  `CREATE TABLE IF NOT EXISTS "TestimonialFollowUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'cron',
    "sentBy" TEXT NOT NULL DEFAULT 'system'
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TestimonialFollowUp_consultationId_key"
     ON "TestimonialFollowUp"("consultationId")`,
];

let ensuredTable: Promise<void> | null = null;

async function ensureFollowUpTable(): Promise<void> {
  if (!ensuredTable) {
    ensuredTable = (async () => {
      const url = process.env.TURSO_DATABASE_URL;
      const token = process.env.TURSO_AUTH_TOKEN;
      if (!url || !token || !/^(libsql|https):\/\//.test(url)) return;
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url, authToken: token });
      for (const ddl of TESTIMONIAL_FOLLOWUP_DDL) {
        await client.execute(ddl);
      }
    })();
  }
  await ensuredTable;
}

// ── due selection (pure, pinned by tests) ──────────────────────────────────

export const FOLLOW_UP_DAYS = 14;

export interface FollowUpCandidate {
  id: string;
  name: string;
  email: string;
  status: string;
  completedAt: Date | null;
}

/**
 * Is this consultation due for the t+14d testimonial follow-up?
 *   · completedAt stamped (the outcome writer's terminal stamp) ...
 *   · ... at least FOLLOW_UP_DAYS ago
 *   · an email address exists (the loop needs a door)
 *   · not cancelled (a cancelled session has nothing to testify about)
 */
export function isFollowUpDue(
  c: Pick<FollowUpCandidate, "email" | "status" | "completedAt">,
  now: Date = new Date()
): boolean {
  if (!c.completedAt) return false;
  if (!c.email || !c.email.includes("@")) return false;
  if (c.status === "CANCELLED") return false;
  const ageDays = (now.getTime() - c.completedAt.getTime()) / 86_400_000;
  return ageDays >= FOLLOW_UP_DAYS;
}

// ── senders ────────────────────────────────────────────────────────────────

const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.astrokalki.com";

export interface FollowUpSendResult {
  ok: boolean;
  skipped?: "no_email" | "not_due" | "send_failed";
  error?: string;
}

/**
 * Send the follow-up email for one consultation and ledger it. Idempotent
 * for the cron (an existing row short-circuits); the archivist's manual
 * nudge passes `force` to re-send and upsert the row.
 */
export async function sendTestimonialFollowUp(
  consultationId: string,
  opts: { force?: boolean; sentBy?: string; channel?: "cron" | "manual" } = {}
): Promise<FollowUpSendResult> {
  const consultation = await db.consultation.findUnique({
    where: { id: consultationId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      completedAt: true,
      outcome: true,
    },
  });
  if (!consultation) return { ok: false, skipped: "not_due", error: "consultation not found" };

  if (!opts.force && !isFollowUpDue(consultation)) {
    return { ok: false, skipped: "not_due" };
  }
  if (!consultation.email || !consultation.email.includes("@")) {
    return { ok: false, skipped: "no_email" };
  }

  await ensureFollowUpTable();

  const email = buildTestimonialFollowUpEmail({
    name: consultation.name,
    context: "consultation",
    siteUrl: SITE_ORIGIN,
  });

  const res = await sendEmail({
    to: consultation.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (!res.ok) {
    return { ok: false, skipped: "send_failed", error: res.error };
  }

  // Ledger: one row per consultation — cron inserts, manual nudge upserts.
  await db.testimonialFollowUp.upsert({
    where: { consultationId: consultation.id },
    create: {
      consultationId: consultation.id,
      channel: opts.channel ?? "cron",
      sentBy: opts.sentBy ?? "system",
    },
    update: {
      sentAt: new Date(),
      channel: opts.channel ?? "manual",
      sentBy: opts.sentBy ?? "system",
    },
  });

  await logAudit({
    action: "testimonial.followup.sent",
    entity: "Consultation",
    entityId: consultation.id,
    before: null,
    after: { channel: opts.channel ?? "cron", sentBy: opts.sentBy ?? "system" },
  }).catch(() => undefined); // fail-soft: audit must not break the send

  return { ok: true };
}

/** Consultations whose completedAt is ≥14d old, not cancelled, with email,
 *  and with no follow-up row yet — the cron's batch (oldest first). */
export async function findFollowUpCandidates(take: number = 20) {
  await ensureFollowUpTable();
  const cutoff = new Date(Date.now() - FOLLOW_UP_DAYS * 86_400_000);
  return db.consultation.findMany({
    where: {
      completedAt: { lte: cutoff, not: null },
      status: { not: "CANCELLED" },
      email: { contains: "@" },
      testimonialFollowUp: { is: null },
    },
    orderBy: { completedAt: "asc" },
    take,
    select: { id: true, name: true, email: true, completedAt: true },
  });
}
