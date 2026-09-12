/**
 * SENTRY SPIKE OBSERVER — Vol. 6 #5 tests.
 *
 * The digest line's doctrine: ABSENT while the founder-gated env trio
 * is unflipped (an absent sensor is not an incident), silent while
 * clean, one line when NEW issues appear in 24h. These pins cover the
 * pure core — payload parsing, the firstSeen window, the line builder.
 */
import { describe, it, expect } from "vitest";
import {
  parseSentryIssues,
  countNewIssues,
  sentryDigestLine,
  type SentrySpikeState,
} from "@/lib/ops/sentry-observe";

const NOW = new Date("2026-09-14T12:00:00Z");

describe("parseSentryIssues — defensive against a moving API", () => {
  it("parses the three fields it needs, ignores the rest", () => {
    const issues = parseSentryIssues([
      {
        shortId: "KALKI-M-1A2",
        title: "TypeError: cannot read properties of undefined",
        count: "14",
        firstSeen: "2026-09-14T08:00:00Z",
        everythingElse: "ignored",
      },
    ]);
    expect(issues).toEqual([
      {
        shortId: "KALKI-M-1A2",
        title: "TypeError: cannot read properties of undefined",
        count: 14,
        firstSeen: "2026-09-14T08:00:00Z",
      },
    ]);
  });

  it("survives non-arrays, nulls and missing fields", () => {
    expect(parseSentryIssues(null)).toEqual([]);
    expect(parseSentryIssues("nope")).toEqual([]);
    expect(parseSentryIssues([null, {}, undefined])).toEqual([
      { shortId: "?", title: "unknown issue", count: 0, firstSeen: "" },
    ]);
  });
});

describe("countNewIssues — 'new' means firstSeen, not merely active", () => {
  it("counts issues first seen inside the 24h window", () => {
    const issues = [
      { shortId: "A", title: "a", count: 1, firstSeen: "2026-09-14T06:00:00Z" },
      { shortId: "B", title: "b", count: 9, firstSeen: "2026-09-10T06:00:00Z" }, // old, still active
      { shortId: "C", title: "c", count: 2, firstSeen: "" }, // unparseable — not counted new
    ];
    expect(countNewIssues(issues, NOW)).toBe(1);
  });

  it("empty list counts zero", () => {
    expect(countNewIssues([], NOW)).toBe(0);
  });
});

describe("sentryDigestLine — absent ≠ incident; quiet on clean; loud on new", () => {
  it("unconfigured or null state emits NO line (the flip is founder-gated)", () => {
    expect(sentryDigestLine(null)).toBe("");
    expect(sentryDigestLine({ configured: false, newCount: 0, unresolvedTotal: 0, top: [] })).toBe("");
  });

  it("clean and configured is silent", () => {
    const state: SentrySpikeState = { configured: true, newCount: 0, unresolvedTotal: 42, top: [] };
    expect(sentryDigestLine(state)).toBe("");
  });

  it("new issues get one line with counts and the top issue", () => {
    const state: SentrySpikeState = {
      configured: true,
      newCount: 3,
      unresolvedTotal: 57,
      top: [{ shortId: "KALKI-M-9Z", title: "Chain exhausted after 3 models", count: 12, firstSeen: "2026-09-14T10:00:00Z" }],
    };
    const line = sentryDigestLine(state);
    expect(line).toMatch(/^SENTRY: 3 new issues in 24h \(57 unresolved\)/);
    expect(line).toContain("KALKI-M-9Z");
    expect(line).toContain("Chain exhausted after 3 models");
  });

  it("singular grammar for one new issue", () => {
    const state: SentrySpikeState = { configured: true, newCount: 1, unresolvedTotal: 1, top: [] };
    expect(sentryDigestLine(state)).toMatch(/^SENTRY: 1 new issue in 24h/);
  });
});
