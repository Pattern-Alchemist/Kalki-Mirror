/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Completion nudge email (Vol. 6 #14)
   ---------------------------------------------------------------------------
   The stale-consultation nudge: when a consultation has been NEW for >48h
   without an outcome or followUpDate set, the cron sends one gentle email
   asking the seeker to close the loop. Mirrors the testimonial-followup
   pattern (Vol. 5 #14): pure functions, identical server-side + tests.

   Consent is the spine: one nudge per consultation (idempotent via the
   CompletionNudge ledger), deep-link to /consultations so they can
   re-engage or cancel. No pressure copy — the seeker's timing is theirs.
   ═══════════════════════════════════════════════════════════════════════════ */

export const COMPLETION_NUDGE_PATH = '/consultations';

export interface CompletionNudgeEmailInput {
  name: string;
  /** What they asked for — the consultation request excerpt. */
  context?: string | null;
  /** Absolute origin, e.g. https://www.astrokalki.com — travels as data. */
  siteUrl: string;
}

export function buildCompletionNudgeEmail(
  input: CompletionNudgeEmailInput,
): { subject: string; html: string; text: string } {
  const who = input.name.trim().split(/\s+/)[0] || 'there';
  const contextLine = input.context?.trim()
    ? `You reached out about "${input.context.trim().slice(0, 80)}".`
    : 'You reached out for a consultation.';
  const consultUrl = `${input.siteUrl.replace(/\/$/, '')}${COMPLETION_NUDGE_PATH}`;

  const subject = 'Your reading — three minutes to close the loop?';

  const text = [
    `Namaste ${who},`,
    ``,
    `${contextLine} I wanted to check in — the request is still open on my end, and I did not want it to fall silent.`,
    ``,
    `If you are still interested, reply here and we will find a time. If the moment has passed, one word and I will close it cleanly — no explanation needed.`,
    ``,
    `You can also re-engage directly here:`,
    `  ${consultUrl}`,
    ``,
    `Either way, thank you for the trust it took to ask.`,
    ``,
    `— Kaustubh, KALKI`,
  ].join('\n');

  const html = [
    `<div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 560px;">`,
    `<h2 style="font-weight: normal; letter-spacing: 0.02em;">Your reading — three minutes?</h2>`,
    `<p>Namaste ${who} — ${contextLine.toLowerCase()} I wanted to check in; the request is still open on my end, and I did not want it to fall silent.</p>`,
    `<p>If you are still interested, <strong>reply here</strong> and we will find a time. If the moment has passed, one word and I will close it cleanly — no explanation needed.</p>`,
    `<p><a href="${consultUrl}" style="display: inline-block; background: #0a0a0a; color: #e8c855; padding: 10px 22px; text-decoration: none; letter-spacing: 0.08em; font-size: 13px;">RE-ENGAGE</a></p>`,
    `<p style="color: #666;">— Kaustubh, KALKI</p>`,
    `</div>`,
  ].join('\n');

  return { subject, html, text };
}
