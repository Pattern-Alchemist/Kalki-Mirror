/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Testimonial follow-up email (Vol. 5 #14)
   ---------------------------------------------------------------------------
   The flywheel's missing leg: consultations complete, the wall on
   /consultations stays empty, and no seeker is ever ASKED. The WhatsApp
   ask (Tier-5 #1) already covers the archivist's manual tap; this is the
   automated t+14d letter — sent once per consultation by the cron, or on
   demand by the archivist's nudge button.

   Consent is the spine of the copy: three honest sentences, first-name
   only, nothing published without an explicit yes. The deep-link lands on
   the seeker's profile intake form (/profile#testimonial) — the same
   Vol. 4 #5 intake the archivist's approval queue reads.

   Pure functions only — identical server-side (cron + nudge action) and
   in tests. The transport (sendEmail) stays fail-soft at the call site.
   ═══════════════════════════════════════════════════════════════════════════ */

/** The intake deep-link path (appended to the site origin by the caller). */
export const TESTIMONIAL_INTAKE_PATH = "/profile#testimonial";

export interface TestimonialFollowUpEmailInput {
  name: string;
  /** What they did — "Pattern Consultation", "3-month japa guidance". */
  context?: string | null;
  /** Absolute origin, e.g. https://www.astrokalki.com — travels as data. */
  siteUrl: string;
}

export function buildTestimonialFollowUpEmail(
  input: TestimonialFollowUpEmailInput
): { subject: string; html: string; text: string } {
  const who = input.name.trim().split(/\s+/)[0] || "there";
  const contextLine = input.context?.trim()
    ? `It has been two weeks since your ${input.context.trim()}.`
    : `It has been two weeks since our session.`;
  const intakeUrl = `${input.siteUrl.replace(/\/$/, "")}${TESTIMONIAL_INTAKE_PATH}`;

  const subject = `Three honest sentences? — KALKI`;

  const text = [
    `Namaste ${who},`,
    ``,
    `${contextLine} The formal part is long done — this is the human part.`,
    ``,
    `If the practice moved something in you, I would be glad to receive three honest sentences: what you noticed, what shifted, and what did not. Your own voice, no polishing required.`,
    ``,
    `With your explicit yes, a line of it may one day help the next seeker decide whether to begin — first name only, nothing published without that yes on file. You can write it here:`,
    ``,
    intakeUrl,
    ``,
    `Or simply reply to this email and I will take it from there.`,
    ``,
    `Either way — thank you for the work you put in.`,
    ``,
    `— Kaustubh, KALKI`,
  ].join("\n");

  const html = [
    `<div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 560px;">`,
    `<h2 style="font-weight: normal; letter-spacing: 0.02em;">Three honest sentences?</h2>`,
    `<p>Namaste ${who} — ${contextLine.toLowerCase()} The formal part is long done; this is the human part.</p>`,
    `<p>If the practice moved something in you, I would be glad to receive <strong>three honest sentences</strong>: what you noticed, what shifted, and what did not. Your own voice, no polishing required.</p>`,
    `<p>With your explicit yes, a line of it may one day help the next seeker decide whether to begin — first name only, nothing published without that yes on file.</p>`,
    `<p><a href="${intakeUrl}" style="display: inline-block; background: #0a0a0a; color: #e8c855; padding: 10px 22px; text-decoration: none; letter-spacing: 0.08em; font-size: 13px;">LEAVE A TESTIMONY</a></p>`,
    `<p style="font-size: 13px; color: #555;">Or simply reply to this email and I will take it from there.</p>`,
    `<p style="color: #666;">— Kaustubh, KALKI</p>`,
    `</div>`,
  ].join("\n");

  return { subject, html, text };
}
