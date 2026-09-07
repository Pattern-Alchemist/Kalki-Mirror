/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Membership request email (Vol. 4 #1)
   ---------------------------------------------------------------------------
   Completes the manual rail's last gap: a seeker requests a membership on
   /pricing, the PENDING row lands in the admin ledger and the archivist
   gets the bell — but the SEEKER never heard anything back. This module
   builds the confirmation: what was requested, how to pay (UPI intent VPA
   + amount, WhatsApp fallback), and what happens next (personal
   reconciliation by Kaustubh, then the grant).

   Pure functions only — identical server-side (the requestMembership
   action) and in tests. The transport (sendEmail) stays fail-soft at the
   call site: an email outage never fails the request itself.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface MembershipRequestEmailInput {
  name: string;
  tierLabel: string;
  amountINR: number;
  /** The archivist's UPI handle — travels as data from resolveUpiConfig(). */
  vpa: string | null;
  payee: string;
}

/** Payment note carried on the UPI intent — kept short per the NPCI tn cap. */
export function membershipUpiNote(plan: string): string {
  return `KALKI ${plan} membership`.slice(0, 40);
}

export function buildMembershipRequestEmail(
  input: MembershipRequestEmailInput,
): { subject: string; html: string; text: string } {
  const { name, tierLabel, amountINR, vpa, payee } = input;
  const amount = `\u20B9${amountINR.toLocaleString("en-IN")}`;
  const who = name.trim() || "seeker";

  const subject = `Your ${tierLabel} membership request — KALKI`;
  const text = [
    `${who},`,
    ``,
    `Your ${tierLabel} membership request is received and pending reconciliation.`,
    ``,
    vpa
      ? `To complete it, pay ${amount} to the UPI handle ${vpa} (${payee}) — the note field is pre-filled in the intent link on the pricing page. Alternatively, reply on WhatsApp and Kaustubh will confirm personally.`
      : `To complete it, coordinate the ${amount} payment on WhatsApp — Kaustubh confirms every membership personally.`,
    ``,
    `Once the payment is reconciled, your tier is granted to this email address. If a console account already exists, the tier attaches to it; otherwise create the account with this same email and the grant resolves on first sign-in.`,
    ``,
    `— Kaustubh, KALKI`,
  ].join("\n");

  const payBlock = vpa
    ? `<p>Pay <strong>${amount}</strong> to the UPI handle <strong>${vpa}</strong> (${payee}) — the intent button on the pricing page pre-fills the amount and note. WhatsApp works too, if that is easier.</p>`
    : `<p>Coordinate the <strong>${amount}</strong> payment on WhatsApp — every membership is confirmed personally.</p>`;

  const html = [
    `<div style="font-family: Georgia, serif; color: #1a1a1a; line-height: 1.6; max-width: 560px;">`,
    `<h2 style="font-weight: normal; letter-spacing: 0.02em;">Your ${tierLabel} membership request</h2>`,
    `<p>${who}, your request is <strong>received and pending reconciliation</strong>.</p>`,
    payBlock,
    `<p>Once the payment is reconciled, your tier is granted to this email address. If a console account already exists, the tier attaches to it; otherwise create the account with this same email and the grant resolves on first sign-in.</p>`,
    `<p style="color: #666;">— Kaustubh, KALKI</p>`,
    `</div>`,
  ].join("\n");

  return { subject, html, text };
}
