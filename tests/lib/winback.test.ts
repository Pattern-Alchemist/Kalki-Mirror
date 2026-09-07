/**
 * WIN-BACK — Vol. 4 #4 tests.
 *
 * The silently-cold segment has two failure modes that would both be
 * betrayals: sending to someone the list is still reaching (warmth
 * gate), and sending twice inside a month (suppression gate). These
 * tests pin both, plus the house letter's voice — no urgency theater,
 * no offers, no list-metadata leakage, no foreign links.
 */
import { describe, it, expect } from "vitest";
import {
  reduceWinbackSegment,
  WINBACK_OPEN_WINDOW_DAYS,
  WINBACK_SUPPRESSION_DAYS,
  WINBACK_KIND,
} from "@/lib/admin/winback";
import { buildWinbackEmail, WINBACK_SUBJECT, WINBACK_BODY } from "@/lib/emails/winback";

const NOW = new Date("2026-09-07T10:00:00Z");
const DAY = 86_400_000;

const daysAgo = (n: number) => new Date(NOW.getTime() - n * DAY).toISOString();

function reduce(overrides: Partial<{
  candidates: { email: string; createdAt: string }[];
  opensInWindow: { email: string }[];
  winbacksInWindow: { email: string }[];
}>) {
  return reduceWinbackSegment({
    now: NOW,
    candidates: [],
    opensInWindow: [],
    winbacksInWindow: [],
    ...overrides,
  });
}

describe("reduceWinbackSegment — the cold rules", () => {
  it("never calls a fresh signup cold (age gate = open window)", () => {
    expect(WINBACK_OPEN_WINDOW_DAYS).toBe(21);
    const r = reduce({
      candidates: [
        { email: "new@x.com", createdAt: daysAgo(20) }, // one day short
        { email: "old@x.com", createdAt: daysAgo(40) }, // long enough
      ],
    });
    expect(r.cold).toEqual(["old@x.com"]);
  });

  it("excludes anyone who opened inside the window (never-opened veterans stay cold)", () => {
    const r = reduce({
      candidates: [
        { email: "quiet@x.com", createdAt: daysAgo(90) },
        { email: "recent-open@x.com", createdAt: daysAgo(90) },
      ],
      opensInWindow: [{ email: "recent-open@x.com" }],
    });
    expect(r.cold).toEqual(["quiet@x.com"]);
  });

  it("suppresses a subscriber win-backed inside 30 days and counts them honestly", () => {
    expect(WINBACK_SUPPRESSION_DAYS).toBe(30);
    const r = reduce({
      candidates: [
        { email: "fresh-winback@x.com", createdAt: daysAgo(90) }, // 29d ago → suppressed
        { email: "due@x.com", createdAt: daysAgo(90) }, // 31d ago → eligible again
        { email: "never@x.com", createdAt: daysAgo(90) }, // never win-backed → eligible
      ],
      winbacksInWindow: [{ email: "fresh-winback@x.com" }],
    });
    expect(r.cold).toEqual(["due@x.com", "never@x.com"]);
    expect(r.suppressed).toBe(1);
  });

  it("is case-insensitive, dedupes candidates, and keeps oldest-join order", () => {
    const r = reduce({
      candidates: [
        { email: "C@X.com", createdAt: daysAgo(60) },
        { email: "c@x.com", createdAt: daysAgo(50) }, // duplicate, ignored
        { email: "B@x.com", createdAt: daysAgo(80) },
        { email: "a@x.com", createdAt: daysAgo(100) },
      ],
    });
    expect(r.cold).toEqual(["a@x.com", "b@x.com", "c@x.com"]);
    expect(r.suppressed).toBe(0);
  });

  it("never invents cold readers from nothing", () => {
    expect(reduce({})).toEqual({ cold: [], suppressed: 0 });
  });
});

describe("winback letter voice", () => {
  const mail = buildWinbackEmail();

  it("carries a subject inside broadcast bounds and one universal body", () => {
    expect(WINBACK_SUBJECT.length).toBeGreaterThanOrEqual(3);
    expect(WINBACK_SUBJECT.length).toBeLessThanOrEqual(200);
    expect(WINBACK_BODY.trim().length).toBeGreaterThanOrEqual(20);
    expect(mail).toEqual({ subject: WINBACK_SUBJECT, body: WINBACK_BODY });
  });

  it("contains no urgency theater, no offers, no list-metadata leakage", () => {
    const haystack = `${mail.subject}\n${mail.body}`.toLowerCase();
    for (const forbidden of [
      "limited", "hurry", "expires", "expiring", "discount", "offer",
      "sale", "buy now", "click here", "last chance", "final hours",
      "act now", "don't miss", "we noticed you haven't opened",
      "haven't opened your", "inactive", "win-back", "winback",
    ]) {
      expect(haystack, `forbidden phrase: ${forbidden}`).not.toContain(forbidden);
    }
  });

  it("links only to the house domain", () => {
    const urls = mail.body.match(/https?:\/\/[^\s)]+/g) ?? [];
    for (const u of urls) expect(u.startsWith("https://www.astrokalki.com")).toBe(true);
  });

  it("carries no personalization slot (one letter for the whole cold segment)", () => {
    expect(mail.body).not.toContain("{{");
    expect(mail.body).not.toContain("}}");
    expect(mail.body).not.toContain("{name}");
  });

  it("offers the practice paths back, not a pitch", () => {
    expect(mail.body).toContain("The 10 Doors");
    expect(mail.body).toContain("library");
    expect(mail.body).toContain("consultation");
  });
});
