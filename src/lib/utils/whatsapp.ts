const WHATSAPP_NUMBER = '918920862931';

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener');
}

/* ═══════════════════════════════════════════════════════════════════════════
   WHATSAPP LEAD ATTRIBUTION (US-acquisition engine, Phase A)
   ---------------------------------------------------------------------------
   Every outbound WhatsApp click should answer two questions the moment the
   chat opens on Kaustubh's phone: WHERE did this seeker come from, and WHAT
   were they reading? The attribution is stamped INTO the prefilled chat text
   — it survives the handoff (wa.me strips everything except `text`), needs
   no analytics platform, no cookies, and leaks zero personal data: only the
   public landing path and an optional content topic.

   Server-safe: no window/document access — server components and static
   renders can build attributed hrefs at build time.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface WhatsAppAttribution {
  /** Content topic the seeker was engaged with, e.g. 'vedic-astrology', 'pattern:the-rescuer', 'mahavidya:kali'. */
  topic?: string;
  /** Public landing path, e.g. '/usa/vedic-astrology-consultation'. No query strings, no personal data. */
  page?: string;
}

const SITE_ORIGIN = 'https://www.astrokalki.com';

/**
 * Build a wa.me deep link with the attribution trailer appended to the
 * chat text. The trailer is a single em-dash line — visually quiet in the
 * chat, machine-greppable for Kaustubh's own lead triage.
 */
export function whatsappUrl(message: string, attribution?: WhatsAppAttribution): string {
  const trailerParts: string[] = [];
  if (attribution?.page) trailerParts.push(`via ${SITE_ORIGIN}${attribution.page}`);
  if (attribution?.topic) trailerParts.push(`topic: ${attribution.topic}`);
  const withTrailer = trailerParts.length
    ? `${message}\n\n— ${trailerParts.join(' · ')}`
    : message;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(withTrailer)}`;
}

/**
 * Deep-link URL for the lead-capture handoff: opens the chat with the
 * seeker's full intake pre-filled, so they only press send. Used by the
 * ConsultationWizard success panel (anchor, not window.open — better
 * a11y and right-click/copy friendly).
 */
export function whatsappIntakeUrl(name: string, intakeSummary: string): string {
  const message = [
    'Namaste Kaustubh — I just completed my consultation intake on astrokalki.com.',
    '',
    `Name: ${name}`,
    '',
    intakeSummary,
    '',
    'Please confirm a time for our session.',
  ].join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Founder-side follow-up link for the admin pipeline: opens a chat with the
 * LEAD (phone from their intake) with a ready-to-send first-touch message.
 * Used by the Consultation Pipeline board's quick action.
 */
export function whatsappFollowUpUrl(name: string, phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return null;
  const first = name.trim().split(/\s+/)[0] || 'there';
  const message = [
    `Namaste ${first} — Kaustubh here from KALKI.`,
    '',
    'I received your consultation intake on astrokalki.com. The patterns you marked are a strong starting point for our first session.',
    '',
    'When would a video call work for you?',
  ].join('\n');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Payment-confirmation handoff (Leak L1 — UPI manual rail): the seeker
 * taps the UPI intent, pays in GPay/PhonePe/Paytm, then opens this chat
 * with the session + amount + payment line pre-filled. When `paid` is
 * false the message states intent to settle after the free discovery call
 * instead — both variants land in the same chat for manual reconciliation.
 */
export function whatsappPaymentUrl(
  name: string,
  opts: { sessionName: string; amountINR: number | null; vpa?: string; paid: boolean },
): string {
  const lines = [
    `Namaste Kaustubh — ${name.trim()} here. I just submitted my consultation intake on astrokalki.com.`,
    '',
    `Session: ${opts.sessionName}`,
  ];
  if (opts.paid && opts.amountINR) {
    lines.push(
      `Payment: ${'\u20B9'}${opts.amountINR.toLocaleString('en-IN')} sent via UPI${opts.vpa ? ` to ${opts.vpa}` : ''} — please confirm receipt.`,
    );
  } else if (opts.amountINR) {
    lines.push(`Payment: I'll settle ${'\u20B9'}${opts.amountINR.toLocaleString('en-IN')} after we fix the slot.`);
  } else {
    lines.push(`Payment: starting with the free discovery call.`);
  }
  lines.push('', 'Please confirm a time for our session.');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Tier-5 #1 — testimonial flywheel ask (t+48h). Opens a chat with a
 * COMPLETED lead asking for three honest sentences about the session,
 * with the explicit-consent line baked in. The archivist taps this from
 * the /admin/consultations drawer when reviewing finished sessions;
 * whatever comes back is entered (consent-gated) in /admin/testimonials
 * and lands PENDING until approved.
 */
export function whatsappTestimonialAskUrl(name: string, phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return null;
  const first = name.trim().split(/\s+/)[0] || 'there';
  const message = [
    `Namaste ${first} — Kaustubh here from KALKI.`,
    '',
    'It has been a couple of days since our session. If you are open to it, send me three honest sentences about how it landed — what you noticed, what shifted, and what did not.',
    '',
    'With your explicit yes, I may share a line of it (first name only) with others who are deciding whether to begin. Your words stay private unless you say otherwise.',
  ].join('\n');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_LINKS = {
  consultation: (service: string, price: string) =>
    "Hello Kaustubh, I'd like to book a " + service + " (" + price + ").",
  siddhi: (name: string) =>
    `Hello Kaustubh, I have a question about the ${name} sādhana practice.`,
  general: "Hello Kaustubh, I'm reaching out from KALKI.",
} as const;
