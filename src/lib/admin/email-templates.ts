// =============================================================
// VOL. 2 #9 — Email template loader + placeholder substitution
// -------------------------------------------------------------
// Pure helpers for the email-template system. The DB-backed overrides
// are read via getEmailTemplate(key); if no override exists, the
// caller falls back to the hardcoded default in src/lib/emails/*.ts.
//
// Placeholders: {{name}}, {{link}}, {{date}}, {{email}}, {{context}}
// are substituted via substitutePlaceholders(subject, body, vars).
// =============================================================

import { db } from '@/lib/db';

export interface EmailTemplateRow {
  id: string;
  key: string;
  subject: string;
  body: string;
  notes: string | null;
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Fetch a DB-backed email template override by key.
 * Returns null if no override exists (caller falls back to hardcoded default).
 */
export async function getEmailTemplate(key: string): Promise<EmailTemplateRow | null> {
  try {
    const row = await db.emailTemplate.findUnique({ where: { key } });
    return row ?? null;
  } catch {
    // Fail-soft: DB unavailable → use hardcoded default
    return null;
  }
}

/**
 * Fetch all DB-backed email templates (for the admin editor).
 */
export async function listEmailTemplates(): Promise<EmailTemplateRow[]> {
  try {
    return await db.emailTemplate.findMany({ orderBy: { key: 'asc' } });
  } catch {
    return [];
  }
}

/**
 * Upsert (create or update) an email template override.
 */
export async function upsertEmailTemplate(input: {
  key: string;
  subject: string;
  body: string;
  notes?: string;
}): Promise<EmailTemplateRow> {
  const key = input.key.trim().toLowerCase().slice(0, 80);
  if (!key) throw new Error('Template key is required');
  if (!input.subject.trim()) throw new Error('Subject is required');
  if (!input.body.trim()) throw new Error('Body is required');

  return db.emailTemplate.upsert({
    where: { key },
    create: {
      key,
      subject: input.subject.trim().slice(0, 200),
      body: input.body.trim().slice(0, 10_000),
      notes: input.notes?.trim().slice(0, 500) || null,
    },
    update: {
      subject: input.subject.trim().slice(0, 200),
      body: input.body.trim().slice(0, 10_000),
      notes: input.notes?.trim().slice(0, 500) || null,
    },
  });
}

/**
 * Delete an email template override (reverts to hardcoded default).
 */
export async function deleteEmailTemplate(key: string): Promise<void> {
  try {
    await db.emailTemplate.delete({ where: { key: key.trim().toLowerCase() } });
  } catch {
    // Already gone — no-op
  }
}

/**
 * Substitute {{placeholders}} in a subject/body. Unknown placeholders
 * are left as-is (so the founder can see what's missing in the preview).
 */
export function substitutePlaceholders(
  text: string,
  vars: Record<string, string | undefined>,
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => {
    const v = vars[name];
    return v !== undefined && v !== null ? v : match;
  });
}

/**
 * The list of known template keys (matching the hardcoded email builders).
 * Used by the admin UI to populate the template picker.
 */
export const KNOWN_TEMPLATE_KEYS = [
  { key: 'completion-nudge', label: 'Completion Nudge', description: 'Sent when a consultation is stale >48h' },
  { key: 'testimonial-followup', label: 'Testimonial Follow-up', description: 'Sent t+14d after a RESOLVED consultation' },
  { key: 'weekly-digest', label: 'Weekly Digest', description: 'Monday digest of new letters + spotlight' },
  { key: 'membership-request', label: 'Membership Request', description: 'Sent when a seeker fills the membership form' },
  { key: 'course-welcome', label: 'Course Welcome', description: 'Sent on first subscription to the email course' },
  { key: 'course-day', label: 'Course Day', description: 'Per-day email for the Doors course' },
  { key: 'broadcast', label: 'Broadcast', description: 'Manual broadcast (sent via /admin/broadcast)' },
] as const;
