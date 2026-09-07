/**
 * MEMBERSHIP REQUEST RAIL — Vol. 4 #1 tests.
 *
 * The manual rail itself is founder-canonical (UPI intent + WhatsApp
 * reconciliation + admin grant — Tier-1 ②). Vol. 4 #1 closed its last gap:
 * the seeker confirmation email. These tests pin the pure surface — the
 * email builder and the UPI note — so the seeker-facing voice and the
 * NPCI note cap can never drift.
 */
import { describe, it, expect } from "vitest";
import {
  buildMembershipRequestEmail,
  membershipUpiNote,
} from "@/lib/emails/membership-request";
import { pricingTiers } from "@/lib/data/pricing";

describe("membershipUpiNote", () => {
  it("formats the plan into the payment note", () => {
    expect(membershipUpiNote("jal")).toBe("KALKI jal membership");
    expect(membershipUpiNote("akash")).toBe("KALKI akash membership");
  });

  it("respects the NPCI tn cap (40 chars) even for adversarial input", () => {
    const note = membershipUpiNote("x".repeat(100));
    expect(note.length).toBeLessThanOrEqual(40);
    expect(note.startsWith("KALKI x")).toBe(true);
  });
});

describe("buildMembershipRequestEmail", () => {
  const base = {
    name: "Ananya",
    tierLabel: "Jal",
    amountINR: 499,
    vpa: "kaustubh@upi",
    payee: "KALKI",
  };

  it("subjects with the tier label and carries the amount", () => {
    const mail = buildMembershipRequestEmail(base);
    expect(mail.subject).toContain("Jal");
    expect(mail.text).toContain("\u20B9499");
    expect(mail.html).toContain("\u20B9499");
  });

  it("shows the UPI handle when configured", () => {
    const mail = buildMembershipRequestEmail(base);
    expect(mail.text).toContain("kaustubh@upi");
    expect(mail.html).toContain("kaustubh@upi");
  });

  it("degrades honestly when the UPI rail is unset (no handle shown)", () => {
    const mail = buildMembershipRequestEmail({ ...base, vpa: null });
    expect(mail.text).not.toContain("upi");
    expect(mail.text).toContain("WhatsApp");
    expect(mail.html).toContain("WhatsApp");
  });

  it("never leaks the raw plan slug as the tier name", () => {
    const mail = buildMembershipRequestEmail(base);
    expect(mail.subject).not.toContain("jal");
    expect(mail.subject).toContain("Jal");
  });

  it("every paid pricing tier resolves to a positive integer amount", () => {
    const paid = pricingTiers.filter((t) => t.priceINR > 0);
    expect(paid.length).toBeGreaterThanOrEqual(3);
    for (const tier of paid) {
      expect(Number.isInteger(tier.priceINR)).toBe(true);
      const mail = buildMembershipRequestEmail({
        name: "x",
        tierLabel: tier.id,
        amountINR: tier.priceINR,
        vpa: null,
        payee: "KALKI",
      });
      expect(mail.text).toContain(String(tier.priceINR.toLocaleString("en-IN")));
    }
  });
});
