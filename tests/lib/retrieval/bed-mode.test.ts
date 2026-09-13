import { describe, it, expect } from "vitest";
import {
  parseStoredBed,
  bedDigestLine,
  type BedVerdict,
} from "@/lib/retrieval/bed-mode";

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #7 — bed-mode observer (OpsState + digest line).
   The doctrine: dense:null is the resting state (not an alarm);
   regression (hybrid < lexical) is an alarm; stale > 7d is an alarm.
   ══════════════════════════════════════════════════════════════ */

const NOW = new Date("2026-09-13T12:00:00Z");

function bed(p: Partial<BedVerdict>): BedVerdict {
  return {
    ranAt: NOW.toISOString(),
    dense: false,
    cases: 12,
    k: 6,
    lexicalHitRate: 1,
    hybridHitRate: null,
    regression: false,
    ...p,
  };
}

describe("parseStoredBed", () => {
  it("returns null for missing/corrupt input", () => {
    expect(parseStoredBed(null)).toBeNull();
    expect(parseStoredBed("")).toBeNull();
    expect(parseStoredBed("not-json")).toBeNull();
    expect(parseStoredBed(JSON.stringify({ ranAt: "x" }))).toBeNull();
  });

  it("round-trips a valid verdict", () => {
    const v = bed({ dense: true, hybridHitRate: 0.92 });
    const round = parseStoredBed(JSON.stringify(v));
    expect(round).not.toBeNull();
    expect(round!.dense).toBe(true);
    expect(round!.hybridHitRate).toBe(0.92);
  });
});

describe("bedDigestLine — resting states", () => {
  it("never-run triggers the run-hint", () => {
    expect(bedDigestLine(null, NOW)).toMatch(/never run/);
  });

  it("healthy hybrid run is silent (empty string)", () => {
    const v = bed({ dense: true, lexicalHitRate: 0.9, hybridHitRate: 0.95 });
    expect(bedDigestLine(v, NOW)).toBe("");
  });

  it("dense:null surfaces a visibility line but NOT an ALERT", () => {
    const v = bed({ dense: false, lexicalHitRate: 0.9, hybridHitRate: null });
    const line = bedDigestLine(v, NOW);
    expect(line).toMatch(/dense:null/);
    expect(line).toMatch(/EMBED_API_KEY unset/);
    expect(line).not.toMatch(/ALERT/);
  });
});

describe("bedDigestLine — alarm states", () => {
  it("alarms when hybrid < lexical (fusion regressed)", () => {
    const v = bed({
      dense: true,
      lexicalHitRate: 0.9,
      hybridHitRate: 0.7,
      regression: true,
    });
    const line = bedDigestLine(v, NOW);
    expect(line).toMatch(/ALERT/);
    expect(line).toMatch(/fusion regressed/);
  });

  it("alarms when stale > 7d", () => {
    const stale = new Date(NOW.getTime() - 8 * 24 * 3_600_000);
    const v = bed({ ranAt: stale.toISOString() });
    const line = bedDigestLine(v, NOW);
    expect(line).toMatch(/last run.*ago.*dead/);
  });
});
