const WHATSAPP_NUMBER = '918920862931';

export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank', 'noopener');
}

export const WHATSAPP_LINKS = {
  consultation: (service: string, price: string) =>
    "Hello Kaustubh, I'd like to book a " + service + " (" + price + ").",
  siddhi: (name: string) =>
    `Hello Kaustubh, I have a question about the ${name} sādhana practice.`,
  general: "Hello Kaustubh, I'm reaching out from AstroKalki.",
} as const;
