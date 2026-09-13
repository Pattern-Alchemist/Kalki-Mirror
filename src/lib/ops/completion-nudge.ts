/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Completion nudge engine (Vol. 6 #14)
   ---------------------------------------------------------------------------
   The stale-consultation loop:
     · a consultation NEW > 48h without an outcome or followUpDate is "stale"
     · the cron sends ONE gentle nudge per consultation (idempotent)
     · the CompletionNudge ledger prevents re-sends (unique on consultationId)
     · the archivist's manual nudge passes `force` to re-send + upsert

   Mirrors the testimonial-followup pattern (Vol. 5 #14) exactly:
     · isStaleConsultation() — pure, pinned by tests
     · findStaleConsultations() — the cron's batch (oldest first)
     · sendCompletionNudge() — send + ledger + audit, fail-soft

   The table self-heals on the remote store (the CronRun pattern).
   ═══════════════════════════════════════════════════════════════════════════ */

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/resend';
import { logAudit } from '@/lib/admin/audit';
import { buildCompletionNudgeEmail } from '@/lib/emails/completion-nudge';

// ── self-healing table (CronRun pattern) ──────────────────────────────────

const COMPLETION_NUDGE_DDL = [
  `CREATE TABLE IF NOT EXISTS "CompletionNudge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'cron',
    "sentBy" TEXT NOT NULL DEFAULT 'system'
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CompletionNudge_consultationId_key"
     ON "CompletionNudge"("consultationId")`,
];

let ensuredTable: Promise<void> | null = null;

async function ensureNudgeTable(): Promise<void> {
  if (!ensuredTable) {
    ensuredTable = (async () => {
      const url = process.env.TURSO_DATABASE_URL;
      const token = process.env.TURSO_AUTH_TOKEN;
      if (!url || !token || !/^(libsql|https):\/\//.test(url)) return;
      const { createClient } = await import('@libsql/client');
      const client = createClient({ url, authToken: token });
      for (const ddl of COMPLETION_NUDGE_DDL) {
        await client.execute(ddl);
      }
    })();
  }
  await ensuredTable;
}

// ── stale detection (pure, pinned by tests) ───────────────────────────────

export const STALE_THRESHOLD_H = 48;

export interface StaleCandidate {
  id: string;
  name: string;
  email: string;
  status: string;
  outcome: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

/**
 * Is this consultation stale (NEW > 48h without closure)?
 *   · not CANCELLED (a cancelled session is closed)
 *   · not completed (completedAt stamped = the outcome writer closed it)
 *   · outcome is not RESOLVED or DISCONTINUED (those are terminal)
 *   · createdAt > 48h ago
 */
export function isStaleConsultation(
  c: Pick<StaleCandidate, 'status' | 'outcome' | 'createdAt' | 'completedAt'>,
  now: Date = new Date(),
): boolean {
  if (c.status === 'CANCELLED') return false;
  if (c.completedAt) return false;
  if (c.outcome === 'RESOLVED' || c.outcome === 'DISCONTINUED') return false;
  const ageH = (now.getTime() - c.createdAt.getTime()) / 3_600_000;
  return ageH >= STALE_THRESHOLD_H;
}

// ── senders ───────────────────────────────────────────────────────────────

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.astrokalki.com';

export interface NudgeSendResult {
  ok: boolean;
  skipped?: 'no_email' | 'not_stale' | 'send_failed';
  error?: string;
}

/**
 * Send the completion nudge for one consultation and ledger it. Idempotent
 * for the cron (an existing row short-circuits); the archivist's manual
 * nudge passes `force` to re-send and upsert the row.
 */
export async function sendCompletionNudge(
  consultationId: string,
  opts: { force?: boolean; sentBy?: string; channel?: 'cron' | 'manual' } = {},
): Promise<NudgeSendResult> {
  const consultation = await db.consultation.findUnique({
    where: { id: consultationId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      outcome: true,
      createdAt: true,
      completedAt: true,
      request: true,
    },
  });
  if (!consultation) return { ok: false, skipped: 'not_stale', error: 'consultation not found' };

  if (!opts.force && !isStaleConsultation(consultation)) {
    return { ok: false, skipped: 'not_stale' };
  }
  if (!consultation.email || !consultation.email.includes('@')) {
    return { ok: false, skipped: 'no_email' };
  }

  await ensureNudgeTable();

  const email = buildCompletionNudgeEmail({
    name: consultation.name,
    context: consultation.request,
    siteUrl: SITE_ORIGIN,
  });

  const res = await sendEmail({
    to: consultation.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (!res.ok) {
    return { ok: false, skipped: 'send_failed', error: res.error };
  }

  // Ledger: one row per consultation — cron inserts, manual nudge upserts.
  await db.completionNudge.upsert({
    where: { consultationId: consultation.id },
    create: {
      consultationId: consultation.id,
      channel: opts.channel ?? 'cron',
      sentBy: opts.sentBy ?? 'system',
    },
    update: {
      sentAt: new Date(),
      channel: opts.channel ?? 'manual',
      sentBy: opts.sentBy ?? 'system',
    },
  });

  await logAudit({
    action: 'completion.nudge.sent',
    entity: 'Consultation',
    entityId: consultation.id,
    before: null,
    after: { channel: opts.channel ?? 'cron', sentBy: opts.sentBy ?? 'system' },
  }).catch(() => undefined); // fail-soft: audit must not break the send

  return { ok: true };
}

/** Consultations that are stale (>48h, no closure) and not yet nudged.
 *  The cron's batch (oldest first). */
export async function findStaleConsultations(take: number = 20) {
  await ensureNudgeTable();
  const cutoff = new Date(Date.now() - STALE_THRESHOLD_H * 3_600_000);
  return db.consultation.findMany({
    where: {
      status: { not: 'CANCELLED' },
      completedAt: null,
      createdAt: { lte: cutoff },
      OR: [{ outcome: null }, { outcome: 'PENDING' }, { outcome: 'IN_PROGRESS' }],
      completionNudges: { none: {} },
      email: { contains: '@' },
    },
    orderBy: { createdAt: 'asc' },
    take,
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      status: true,
      outcome: true,
      request: true,
    },
  });
}

/** Count stale consultations for the digest line (no email filter —
 *  the count includes emailless leads too, so the founder sees the
 *  full backlog even if the nudge can't reach them). */
export async function countStaleConsultations(): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_THRESHOLD_H * 3_600_000);
  return db.consultation.count({
    where: {
      status: { not: 'CANCELLED' },
      completedAt: null,
      createdAt: { lte: cutoff },
      OR: [{ outcome: null }, { outcome: 'PENDING' }, { outcome: 'IN_PROGRESS' }],
    },
  });
}
