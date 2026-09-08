// =============================================================
// KALKI — Testimonial flywheel tests (Vol. 5 #14)
// -------------------------------------------------------------
// Pure pins for the flywheel's ask leg: the email builder (consent
// spine, intake deep-link, name handling), the t+14d due gate
// (boundary + email + cancelled exclusions), and the schedule
// contract (vercel.json mirrors REGISTERED_CRONS — the ledger
// alarm is only as honest as the mirror).
// =============================================================
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildTestimonialFollowUpEmail,
  TESTIMONIAL_INTAKE_PATH,
} from "@/lib/emails/testimonial-followup";
import {
  isFollowUpDue,
  FOLLOW_UP_DAYS,
} from "@/lib/ops/testimonial-followup";
import { REGISTERED_CRONS } from "@/lib/cron-ledger";

const SITE = "https://www.astrokalki.com";

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

describe("testimonial follow-up email", () => {
  const email = buildTestimonialFollowUpEmail({
    name: "Ananya Menon",
    context: "consultation",
    siteUrl: SITE,
  });

  it("addresses the seeker by first name only (privacy spine)", () => {
    expect(email.text).toContain("Namaste Ananya,");
    expect(email.text).not.toContain("Menon");
    expect(email.html).toContain("Namaste Ananya");
    expect(email.html).not.toContain("Menon");
  });

  it("deep-links the profile intake form with the anchor", () => {
    const link = `${SITE}${TESTIMONIAL_INTAKE_PATH}`;
    expect(TESTIMONIAL_INTAKE_PATH).toBe("/profile#testimonial");
    expect(email.text).toContain(link);
    expect(email.html).toContain(`href="${link}"`);
  });

  it("carries the explicit-consent line in both bodies", () => {
    for (const body of [email.text, email.html]) {
      expect(body).toContain("explicit yes");
      expect(body).toContain("first name only");
    }
  });

  it("asks for three honest sentences — the WhatsApp ask's register", () => {
    expect(email.subject).toContain("Three honest sentences");
    expect(email.text).toContain("three honest sentences");
    expect(email.text).toContain("what you noticed, what shifted, and what did not");
  });

  it("mentions the session context when present", () => {
    expect(email.text).toContain("two weeks since your consultation");
  });

  it("degrades gracefully without a context line", () => {
    const bare = buildTestimonialFollowUpEmail({ name: "R", context: null, siteUrl: SITE });
    expect(bare.text).toContain("two weeks since our session");
  });

  it("strips a trailing slash from the site origin", () => {
    const weird = buildTestimonialFollowUpEmail({
      name: "R",
      context: null,
      siteUrl: "https://www.astrokalki.com/",
    });
    expect(weird.html).toContain('href="https://www.astrokalki.com/profile#testimonial"');
  });
});

describe("t+14d due gate", () => {
  const base = { email: "seeker@example.com", status: "COMPLETED" };

  it("is due exactly at the 14-day boundary", () => {
    expect(FOLLOW_UP_DAYS).toBe(14);
    expect(isFollowUpDue({ ...base, completedAt: daysAgo(14) })).toBe(true);
    expect(isFollowUpDue({ ...base, completedAt: daysAgo(13.9) })).toBe(false);
  });

  it("requires a completedAt stamp", () => {
    expect(isFollowUpDue({ ...base, completedAt: null })).toBe(false);
  });

  it("requires a plausible email address", () => {
    expect(isFollowUpDue({ ...base, email: "", completedAt: daysAgo(30) })).toBe(false);
    expect(isFollowUpDue({ ...base, email: "not-an-email", completedAt: daysAgo(30) })).toBe(false);
  });

  it("never asks a cancelled consultation", () => {
    expect(
      isFollowUpDue({ email: "seeker@example.com", status: "CANCELLED", completedAt: daysAgo(30) })
    ).toBe(false);
  });
});

describe("schedule contract", () => {
  it("the follow-up cron is registered and mirrors vercel.json", () => {
    expect(REGISTERED_CRONS["testimonial-followup"].schedule).toBe("25 2 * * *");
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8")) as {
      crons: Array<{ path: string; schedule: string }>;
    };
    const mine = vercel.crons.find((c) => c.path === "/api/cron/testimonial-followup");
    expect(mine).toBeDefined();
    expect(mine?.schedule).toBe(REGISTERED_CRONS["testimonial-followup"].schedule);
  });

  it("the new cron slot does not collide with its neighbours (2 AM cluster)", () => {
    const schedules = Object.values(REGISTERED_CRONS).map((c) => c.schedule);
    expect(new Set(schedules).size).toBe(schedules.length);
  });
});
