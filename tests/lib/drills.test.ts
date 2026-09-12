/**
 * DRILL VERDICT LEDGER — Vol. 6 #3 tests.
 *
 * The doctrine under test: a drill that never reports IS a failure.
 * Silence is the one verdict a guard must never be allowed. These pins
 * cover the pure core — strict verdict parsing, the 8-day staleness
 * line, and the digest line that goes quiet on green and stays loud
 * on anything else.
 */
import { describe, it, expect } from "vitest";
import {
  parseStoredDrill,
  isDrillStale,
  drillsDigestLine,
  DRILLS,
  DRILL_STALE_MS,
  type StoredDrill,
} from "@/lib/ops/drills";

const NOW = new Date("2026-09-14T12:00:00Z");

function drill(over: Partial<StoredDrill> = {}): StoredDrill {
  return {
    name: "page-weight",
    verdict: "pass",
    at: "2026-09-13T05:00:00Z",
    source: "gh",
    ...over,
  };
}

describe("parseStoredDrill — strict shape, malformed is a bug not data", () => {
  it("accepts a well-formed verdict", () => {
    expect(parseStoredDrill(JSON.stringify(drill()))).toEqual(drill());
  });

  it("rejects null/empty/garbage", () => {
    expect(parseStoredDrill(null)).toBeNull();
    expect(parseStoredDrill(undefined)).toBeNull();
    expect(parseStoredDrill("not json at all")).toBeNull();
    expect(parseStoredDrill("{}")).toBeNull();
  });

  it("rejects unknown drill names and verdicts", () => {
    expect(parseStoredDrill(JSON.stringify(drill({ name: "restore" as never })))).toBeNull();
    expect(parseStoredDrill(JSON.stringify(drill({ verdict: "green" as never })))).toBeNull();
  });

  it("rejects unparseable or missing timestamps", () => {
    expect(parseStoredDrill(JSON.stringify(drill({ at: "yesterday" })))).toBeNull();
    expect(parseStoredDrill(JSON.stringify(drill({ at: undefined as never })))).toBeNull();
  });

  it("keeps optional details, rejects non-string source", () => {
    expect(parseStoredDrill(JSON.stringify(drill({ details: "28/28" })))?.details).toBe("28/28");
    expect(parseStoredDrill(JSON.stringify(drill({ source: 7 as never })))).toBeNull();
  });
});

describe("isDrillStale — a drill silent > 8d reads as failed", () => {
  it("no verdict at all is stale", () => {
    expect(isDrillStale(null, NOW)).toBe(true);
    expect(isDrillStale(undefined, NOW)).toBe(true);
  });

  it("fresh pass is not stale", () => {
    expect(isDrillStale(drill({ at: "2026-09-13T05:00:00Z" }), NOW)).toBe(false);
  });

  it("exactly at the window boundary is not yet stale; a breath past it is", () => {
    const edge = new Date(NOW.getTime() - DRILL_STALE_MS);
    expect(isDrillStale(drill({ at: edge.toISOString() }), NOW)).toBe(false);
    expect(isDrillStale(drill({ at: new Date(edge.getTime() - 1000).toISOString() }), NOW)).toBe(true);
  });

  it("a FAIL verdict still carries its age honestly (stale only by time)", () => {
    const freshFail = drill({ verdict: "fail", at: "2026-09-14T00:00:00Z" });
    expect(isDrillStale(freshFail, NOW)).toBe(false);
  });
});

describe("drillsDigestLine — quiet on green, loud on everything else", () => {
  const allGreen = (): Record<string, StoredDrill | null> =>
    Object.fromEntries(
      DRILLS.map((n, i) => [
        n,
        drill({ name: n, at: new Date(NOW.getTime() - (i + 1) * 3600_000).toISOString() }),
      ]),
    );

  it("all green + fresh → one quiet line", () => {
    const line = drillsDigestLine(allGreen(), NOW);
    expect(line).toMatch(/^DRILLS: all green/);
    expect(line).not.toMatch(/ALERT/);
  });

  it("a failed drill alerts with the name and date", () => {
    const states = allGreen();
    states["turso-failover"] = drill({ name: "turso-failover", verdict: "fail", at: "2026-09-14T04:00:00Z", details: "12/18" });
    const line = drillsDigestLine(states, NOW);
    expect(line).toMatch(/^DRILLS ALERT:/);
    expect(line).toMatch(/turso-failover: FAILED 2026-09-14 \(12\/18\)/);
  });

  it("a silent drill is never given the benefit of the doubt", () => {
    const states = allGreen();
    delete states["chain-probe"];
    const line = drillsDigestLine(states, NOW);
    expect(line).toMatch(/chain-probe: never reported/);
  });

  it("a stale pass alerts too — last week's green is not this week's green", () => {
    const states = allGreen();
    states["page-weight"] = drill({
      name: "page-weight",
      at: new Date(NOW.getTime() - 9 * 24 * 3600_000).toISOString(),
    });
    const line = drillsDigestLine(states, NOW);
    expect(line).toMatch(/page-weight: stale/);
  });

  it("unparseable stored rows count as never reported", () => {
    const states = allGreen();
    states["page-weight"] = null;
    expect(drillsDigestLine(states, NOW)).toMatch(/page-weight: never reported/);
  });
});
