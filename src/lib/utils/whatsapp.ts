const WHATSAPP_NUMBER = '918920862931';

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener');
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

export const WHATSAPP_LINKS = {
  consultation: (service: string, price: string) =>
    "Hello Kaustubh, I'd like to book a " + service + " (" + price + ").",
  siddhi: (name: string) =>
    `Hello Kaustubh, I have a question about the ${name} sādhana practice.`,
  general: "Hello Kaustubh, I'm reaching out from KALKI.",
} as const;
