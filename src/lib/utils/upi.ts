/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — UPI payment rail (Leak L1 closure)
   ---------------------------------------------------------------------------
   DECISION (founder, L1): "just Google Pay or UPI available for now through
   WhatsApp" — a MANUAL rail. No Razorpay, no gateway, no webhooks, no schema.
   The seeker taps a standard `upi://pay` intent (opens GPay / PhonePe / Paytm
   with amount + payee pre-filled), then confirms on WhatsApp where Kaustubh
   reconciles the receipt by hand.

   Design constraints honoured:
     · Pure functions only — identical on server (action result) and client
       (amount selection happens after submit). No env reads here: the VPA
       travels as data from the Server Action, so setting `UPI_VPA` in Vercel
       activates the payment block with NO rebuild.
     · INR only — UPI is an Indian rail; international seekers coordinate
       directly on WhatsApp (existing manual flow, unchanged).
     · Zero dependencies — the intent URL is the entire integration.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PaidSession {
  slug: string;
  name: string;
  amountINR: number;
  blurb: string;
}

/**
 * The paid consultation services (mirrors consultationServices in
 * data/consultations.ts but with machine amounts — the /consultations page
 * prices stay the display source of truth; these power the intent links).
 * Archival Discovery is free (no rail needed); Lineage Introduction is
 * Akash-membership only (never sold per-session).
 */
export const PAID_SESSIONS: PaidSession[] = [
  {
    slug: 'practice-consultation',
    name: 'Pattern Consultation',
    amountINR: 1999,
    blurb: '60 min · focused one-on-one',
  },
  {
    slug: 'shadow-pattern-reading',
    name: 'Shadow Dossier',
    amountINR: 3499,
    blurb: '90 min · deep-dive + written summary',
  },
];

export interface UpiIntentInput {
  vpa: string;
  payee: string;
  amountINR: number;
  note: string;
}

/**
 * Standard UPI intent URL (NPCI spec). Works on any Indian UPI app:
 *   upi://pay?pa=<vpa>&pn=<payee>&am=<amount>&cu=INR&tn=<note>
 * `tn` stays short and static — reconciliation happens on the reference
 * number Kaustubh quotes back, not in the note field.
 *
 * Vol. 3 #17: guards the revenue rail — a non-positive amount would emit
 * a ₹0/negative collect request, and a VPA without a @ handle would route
 * money to nobody. Both are programmer bugs, so both throw loudly here
 * rather than producing a plausible-looking broken intent link.
 */
export function buildUpiPayUrl({ vpa, payee, amountINR, note }: UpiIntentInput): string {
  if (!Number.isInteger(amountINR) || amountINR <= 0) {
    throw new Error(`buildUpiPayUrl: amountINR must be a positive integer, got ${amountINR}`);
  }
  if (!/^[^@\s]+@[^@\s]+$/.test(vpa)) {
    throw new Error(`buildUpiPayUrl: vpa must be a handle@bank UPI id, got "${vpa}"`);
  }
  const params = new URLSearchParams({
    pa: vpa,
    pn: payee,
    am: String(amountINR),
    cu: 'INR',
    tn: note.slice(0, 40),
  });
  return `upi://pay?${params.toString()}`;
}

export function formatINR(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

/** Server-side resolver for the action result — reads env once, returns null when unset. */
export function resolveUpiConfig(): { vpa: string; payee: string } | null {
  const vpa = process.env.UPI_VPA ?? process.env.NEXT_PUBLIC_UPI_VPA ?? '';
  if (!vpa) return null;
  const payee = process.env.UPI_PAYEE ?? 'KALKI';
  return { vpa: vpa.trim(), payee };
}
