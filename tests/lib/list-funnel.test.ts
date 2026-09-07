/**
 * LIST FUNNEL — Vol. 4 #3 tests.
 *
 * The war-room panel and the daily digest line share one pure builder
 * (list-funnel.ts). These tests pin the cohort math — week bucketing,
 * the five stages joined on the subscriber's email, the honest
 * non-nesting of open/click stages, and the digest line's
 * prefer-last-complete-week rule — so the funnel can never quietly
 * drift into flattery.
 */
import { describe, it, expect } from "vitest";
import {
  buildListFunnel,
  listFunnelDigestLine,
  weekStartUtc,
  LIST_FUNNEL_WEEKS,
  type FunnelSubscriber,
  type Door3Send,
  type EmailEventRow,
  type ConsultationRow,
} from "@/lib/admin/list-funnel";

// Fixed Wednesday anchor: cohorts run Mon 27 Jul … Mon 31 Aug (in flight).
const NOW = new Date("2026-09-02T10:00:00Z");
const W_MON = ["2026-07-27", "2026-08-03", "2026-08-10", "2026-08-17", "2026-08-24", "2026-08-31"];

const sub = (email: string, iso: string): FunnelSubscriber => ({ email, createdAt: iso });
const d3 = (email: string, emailId: string): Door3Send => ({ email, emailId });
const ev = (email: string, emailId: string, type: string, url: string | null = null): EmailEventRow => ({
  email,
  emailId,
  type,
  url,
});
const consult = (email: string, iso: string): ConsultationRow => ({ email, createdAt: iso });

function build(overrides: Partial<{
  subscribers: FunnelSubscriber[];
  door3Sends: Door3Send[];
  events: EmailEventRow[];
  consultations: ConsultationRow[];
  now: Date;
}>) {
  return buildListFunnel({
    subscribers: [],
    door3Sends: [],
    events: [],
    consultations: [],
    now: NOW,
    ...overrides,
  });
}

describe("weekStartUtc", () => {
  it("anchors every day to its Monday 00:00 UTC", () => {
    expect(weekStartUtc(new Date("2026-09-02T10:00:00Z")).toISOString()).toBe("2026-08-31T00:00:00.000Z"); // Wed
    expect(weekStartUtc(new Date("2026-08-31T23:59:00Z")).toISOString()).toBe("2026-08-31T00:00:00.000Z"); // Mon
    expect(weekStartUtc(new Date("2026-09-06T05:00:00Z")).toISOString()).toBe("2026-08-31T00:00:00.000Z"); // Sun
  });
});

describe("buildListFunnel — cohort bucketing", () => {
  it("emits LIST_FUNNEL_WEEKS zeroed cohorts oldest→newest on empty input", () => {
    const cohorts = build({});
    expect(cohorts).toHaveLength(LIST_FUNNEL_WEEKS);
    expect(cohorts.map((c) => c.weekStart)).toEqual(W_MON);
    for (const c of cohorts) {
      expect(c.subscribed).toBe(0);
      expect(c.d3Opened).toBe(0);
      expect(c.clicked).toBe(0);
      expect(c.consulted).toBe(0);
      expect(c.lead).toBe(0);
    }
  });

  it("buckets subscribers by their join week and ignores out-of-window rows", () => {
    const cohorts = build({
      subscribers: [
        sub("a@x.com", "2026-08-04T09:00:00Z"), // week of 08-03
        sub("B@X.com", "2026-08-05T22:00:00Z"), // same week, mixed case
        sub("c@x.com", "2026-09-01T09:00:00Z"), // in-flight week (08-31)
        sub("old@x.com", "2026-07-01T09:00:00Z"), // before the window
        sub("far@x.com", "2027-01-01T09:00:00Z"), // after the window
      ],
    });
    expect(cohorts[1].subscribed).toBe(2);
    expect(cohorts[5].subscribed).toBe(1);
    expect(cohorts[0].subscribed).toBe(0);
  });

  it("counts a resubscribe honestly in the ledger, first join wins the stages", () => {
    const cohorts = build({
      subscribers: [sub("a@x.com", "2026-08-04T09:00:00Z"), sub("a@x.com", "2026-09-01T09:00:00Z")],
    });
    expect(cohorts[1].subscribed).toBe(1);
    expect(cohorts[5].subscribed).toBe(1);
  });
});

describe("buildListFunnel — stages", () => {
  it("Door-3 open requires BOTH a doorDay-3 send and an opened event on that emailId", () => {
    const base = {
      subscribers: [sub("a@x.com", "2026-08-04T09:00:00Z"), sub("b@x.com", "2026-08-04T09:00:00Z")],
      door3Sends: [d3("a@x.com", "resend-aaa"), d3("b@x.com", "resend-bbb")],
      events: [
        ev("a@x.com", "resend-aaa", "email.opened"), // true D3 open
        ev("b@x.com", "resend-other", "email.opened"), // opened, but a different send
      ],
    };
    const cohorts = build(base);
    expect(cohorts[1].d3Opened).toBe(1);
  });

  it("counts many opens once, and never lets a stage exceed the cohort", () => {
    const cohorts = build({
      subscribers: [sub("a@x.com", "2026-08-04T09:00:00Z")],
      door3Sends: [d3("a@x.com", "resend-aaa")],
      events: [
        ev("A@X.com", "resend-aaa", "email.opened"),
        ev("a@x.com", "resend-aaa", "email.opened"),
        ev("a@x.com", "resend-aaa", "email.opened"),
      ],
    });
    expect(cohorts[1].d3Opened).toBe(1);
    expect(cohorts[1].d3Opened).toBeLessThanOrEqual(cohorts[1].subscribed);
  });

  it("keeps open and click stages independent (pixel-blocked clicker counts in clicks)", () => {
    const cohorts = build({
      subscribers: [sub("a@x.com", "2026-08-04T09:00:00Z")],
      events: [ev("a@x.com", "resend-anything", "email.clicked", "https://www.astrokalki.com/glossary/prana")],
    });
    expect(cohorts[1].d3Opened).toBe(0);
    expect(cohorts[1].clicked).toBe(1);
  });

  it("stage 4 counts only clicks whose URL lands on /consultations", () => {
    const cohorts = build({
      subscribers: [sub("a@x.com", "2026-08-04T09:00:00Z"), sub("b@x.com", "2026-08-04T09:00:00Z")],
      events: [
        ev("a@x.com", "r1", "email.clicked", "https://www.astrokalki.com/consultations"),
        ev("b@x.com", "r2", "email.clicked", "https://www.astrokalki.com/library/practice"),
      ],
    });
    expect(cohorts[1].consulted).toBe(1);
  });

  it("stage 5 requires a Consultation row created AFTER the join instant", () => {
    const cohorts = build({
      subscribers: [sub("a@x.com", "2026-08-04T09:00:00Z"), sub("b@x.com", "2026-08-04T09:00:00Z")],
      consultations: [
        consult("a@x.com", "2026-08-06T09:00:00Z"), // after join → counts
        consult("b@x.com", "2026-08-01T09:00:00Z"), // before join → doesn't
      ],
    });
    expect(cohorts[1].lead).toBe(1);
  });

  it("is case-insensitive end to end (subscriber, sends, events, ledger)", () => {
    const cohorts = build({
      subscribers: [sub("Ananya@X.com", "2026-08-04T09:00:00Z")],
      door3Sends: [d3("ananya@x.com", "r1")],
      events: [ev("ANANYA@x.com", "r1", "email.opened")],
      consultations: [consult("ananya@X.com", "2026-08-05T09:00:00Z")],
    });
    expect(cohorts[1]).toMatchObject({ subscribed: 1, d3Opened: 1, lead: 1 });
  });
});

describe("listFunnelDigestLine", () => {
  it("prefers the last COMPLETE week (the in-flight week is not a verdict)", () => {
    const cohorts = build({
      subscribers: [
        sub("a@x.com", "2026-08-25T09:00:00Z"), // complete week (08-24)
        sub("b@x.com", "2026-09-01T09:00:00Z"), // in flight (08-31)
      ],
    });
    const line = listFunnelDigestLine(cohorts);
    expect(line).toContain("week of 24 Aug");
    expect(line).toContain("1 joined");
  });

  it("falls back to the in-flight week when the last complete one is silent", () => {
    const cohorts = build({ subscribers: [sub("b@x.com", "2026-09-01T09:00:00Z")] });
    expect(listFunnelDigestLine(cohorts)).toContain("week so far — 31 Aug");
  });

  it("returns null for an all-silence window and for empty input", () => {
    expect(listFunnelDigestLine(build({}))).toBeNull();
    expect(listFunnelDigestLine([])).toBeNull();
  });

  it("renders the full stage chain with honest pluralization", () => {
    const cohorts = build({
      subscribers: [
        sub("a@x.com", "2026-08-25T09:00:00Z"),
        sub("b@x.com", "2026-08-25T10:00:00Z"),
        sub("c@x.com", "2026-08-26T10:00:00Z"),
      ],
      door3Sends: [d3("a@x.com", "r1"), d3("b@x.com", "r2")],
      events: [
        ev("a@x.com", "r1", "email.opened"),
        ev("b@x.com", "r2", "email.opened"),
        ev("a@x.com", "r9", "email.clicked", "https://www.astrokalki.com/consultations"),
        ev("c@x.com", "r8", "email.clicked", "https://www.astrokalki.com/primer"),
      ],
      consultations: [consult("a@x.com", "2026-08-27T09:00:00Z")],
    });
    const line = listFunnelDigestLine(cohorts)!;
    expect(line).toBe(
      "List funnel (week of 24 Aug): 3 joined → 2 opened Door 3 → 2 clicked → 1 to /consultations → 1 intake",
    );
  });
});
