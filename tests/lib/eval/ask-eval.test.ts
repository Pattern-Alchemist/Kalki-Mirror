import { describe, it, expect } from "vitest";
import { judge, rollup, type AskOutcome } from "@/lib/eval/ask-eval";
import { GOLDEN_SET, GOLDEN_IDS } from "@/lib/eval/golden-set";
import { extractCitationSlugs } from "@/app/api/cron/ask-eval/route";
import {
  parseStoredGoldenAsk,
  goldenAskDigestLine,
  goldenAskAgeHours,
  nextConsecutiveFailures,
  GOLDEN_ASK_MAX_AGE_H,
  type StoredGoldenAsk,
} from "@/lib/eval/ask-eval-observe";

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #6 — golden-set eval harness.
   The honest-silence lesson from the ops-day2 smoke (2026-09-09):
   a grounded=false completion is a VALID model output, not a failure.
   The judge must accept it on a silence case AND reject it on a
   grounded case, AND never let a hallucinated grounding slip past.
   ══════════════════════════════════════════════════════════════ */

const out = (o: Partial<AskOutcome>): AskOutcome => ({
  grounded: false,
  citations: [],
  ms: 100,
  ...o,
});

const BUDGET = 12_000;

describe("golden-set (data integrity)", () => {
  it("has 12 grounded + 5 silence cases = 17 total", () => {
    const grounded = GOLDEN_SET.filter((c) => c.kind === "grounded");
    const silence = GOLDEN_SET.filter((c) => c.kind === "silence");
    expect(grounded).toHaveLength(12);
    expect(silence).toHaveLength(5);
  });

  it("every grounded case has at least one expected citation slug", () => {
    for (const c of GOLDEN_SET) {
      if (c.kind === "grounded") {
        expect(c.expectCitations.length).toBeGreaterThan(0);
        for (const s of c.expectCitations) {
          expect(typeof s).toBe("string");
          expect(s.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("every case has a non-empty query and a unique id", () => {
    const ids = new Set<string>();
    for (const c of GOLDEN_SET) {
      expect(c.query.length).toBeGreaterThan(0);
      expect(ids.has(c.id)).toBe(false);
      ids.add(c.id);
    }
  });

  it("GOLDEN_IDS matches GOLDEN_SET ids in order", () => {
    expect(GOLDEN_IDS).toEqual(GOLDEN_SET.map((c) => c.id));
  });
});

describe("judge — grounded contract", () => {
  const g = {
    id: "g-1",
    kind: "grounded" as const,
    query: "q",
    expectCitations: ["gayatri-mantra"],
  };

  it("passes grounded + citation in budget", () => {
    expect(
      judge(g, out({ grounded: true, citations: ["gayatri-mantra"], ms: 8_000 }), BUDGET).ok,
    ).toBe(true);
  });

  it("passes when extra citations accompany the expected slug", () => {
    const v = judge(
      g,
      out({ grounded: true, citations: ["pranava-japa", "gayatri-mantra"], ms: 8_000 }),
      BUDGET,
    );
    expect(v.ok).toBe(true);
  });

  it("fails grounded gone silent", () => {
    expect(judge(g, out({}), BUDGET).reason).toMatch(/silence/);
  });

  it("fails missing expected citation", () => {
    const v = judge(g, out({ grounded: true, citations: ["other-slug"], ms: 8_000 }), BUDGET);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/missing.*gayatri-mantra/);
  });

  it("fails fresh-path budget blow", () => {
    const v = judge(g, out({ grounded: true, citations: ["gayatri-mantra"], ms: 13_000 }), BUDGET);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/budget/);
  });

  it("cache hit bypasses budget (latency is the cache's, not the chain's)", () => {
    const v = judge(
      g,
      out({ grounded: true, citations: ["gayatri-mantra"], ms: 99_000, cached: true }),
      BUDGET,
    );
    expect(v.ok).toBe(true);
  });

  it("error path fails with the error message", () => {
    const v = judge(g, out({ error: "ETIMEDOUT" }), BUDGET);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/ETIMEDOUT/);
  });
});

describe("judge — silence contract (the hallucination net)", () => {
  const s = { id: "s-1", kind: "silence" as const, query: "q" };

  it("passes honest silence in budget", () => {
    expect(judge(s, out({ grounded: false }), BUDGET).ok).toBe(true);
  });

  it("fails hallucinated grounding on a silence case", () => {
    const v = judge(s, out({ grounded: true, citations: ["x"] }), BUDGET);
    expect(v.ok).toBe(false);
    expect(v.reason).toMatch(/expected honest silence.*got grounded/);
  });
});

describe("rollup (statistics)", () => {
  it("computes pass/fail counts + p50/p95", () => {
    const cases = [
      { id: "a", kind: "grounded", ok: true, ms: 100 },
      { id: "b", kind: "grounded", ok: true, ms: 200 },
      { id: "c", kind: "grounded", ok: true, ms: 300 },
      { id: "d", kind: "silence", ok: false, ms: 400, reason: "fail" },
    ];
    const r = rollup(cases);
    expect(r.pass).toBe(3);
    expect(r.fail).toBe(1);
    expect(r.p50).toBeGreaterThanOrEqual(100);
    expect(r.p95).toBeGreaterThanOrEqual(r.p50);
  });

  it("empty cases yields zeroed stats without throwing", () => {
    const r = rollup([]);
    expect(r.pass).toBe(0);
    expect(r.fail).toBe(0);
    expect(r.p50).toBe(0);
    expect(r.p95).toBe(0);
  });
});

describe("ask-eval-observe (OpsState + digest)", () => {
  const NOW = new Date("2026-09-13T12:00:00Z");

  it("parseStoredGoldenAsk returns null for missing/corrupt input", () => {
    expect(parseStoredGoldenAsk(null)).toBeNull();
    expect(parseStoredGoldenAsk("")).toBeNull();
    expect(parseStoredGoldenAsk("not-json")).toBeNull();
    expect(parseStoredGoldenAsk(JSON.stringify({ rollup: {} }))).toBeNull();
  });

  it("parseStoredGoldenAsk round-trips a valid StoredGoldenAsk", () => {
    const s: StoredGoldenAsk = {
      rollup: {
        ranAt: NOW.toISOString(),
        pass: 12,
        fail: 0,
        p50: 3000,
        p95: 9000,
        cases: [],
      },
      consecutiveFailures: 0,
      checkedAt: NOW.toISOString(),
    };
    const round = parseStoredGoldenAsk(JSON.stringify(s));
    expect(round).not.toBeNull();
    expect(round!.rollup.pass).toBe(12);
    expect(round!.consecutiveFailures).toBe(0);
  });

  it("goldenAskAgeHours is Infinity for missing/invalid", () => {
    expect(goldenAskAgeHours(null)).toBe(Infinity);
    expect(goldenAskAgeHours({ rollup: {} as any, consecutiveFailures: 0, checkedAt: "bad" })).toBe(Infinity);
  });

  it("goldenAskAgeHours computes hours since checkedAt", () => {
    const twoHoursAgo = new Date(NOW.getTime() - 2 * 3_600_000);
    const s: StoredGoldenAsk = {
      rollup: { ranAt: twoHoursAgo.toISOString(), pass: 12, fail: 0, p50: 0, p95: 0, cases: [] },
      consecutiveFailures: 0,
      checkedAt: twoHoursAgo.toISOString(),
    };
    expect(Math.round(goldenAskAgeHours(s, NOW))).toBe(2);
  });

  it("digest line is silent on green + fresh", () => {
    const s: StoredGoldenAsk = {
      rollup: { ranAt: NOW.toISOString(), pass: 17, fail: 0, p50: 3000, p95: 9000, cases: [] },
      consecutiveFailures: 0,
      checkedAt: NOW.toISOString(),
    };
    expect(goldenAskDigestLine(s, NOW)).toBe("");
  });

  it("digest line never-run triggers the run-hint", () => {
    expect(goldenAskDigestLine(null, NOW)).toMatch(/never run/);
  });

  it("digest line alarms when stale > 25h", () => {
    const stale = new Date(NOW.getTime() - 30 * 3_600_000);
    const s: StoredGoldenAsk = {
      rollup: { ranAt: stale.toISOString(), pass: 17, fail: 0, p50: 0, p95: 0, cases: [] },
      consecutiveFailures: 0,
      checkedAt: stale.toISOString(),
    };
    expect(goldenAskDigestLine(s, NOW)).toMatch(/last run.*ago.*dead/);
  });

  it("digest line SOFT-logs first-strike fail (no ALERT keyword)", () => {
    const s: StoredGoldenAsk = {
      rollup: {
        ranAt: NOW.toISOString(),
        pass: 16,
        fail: 1,
        p50: 3000,
        p95: 9000,
        cases: [{ id: "g-001", kind: "grounded", ok: false, ms: 8000, reason: "missing citations: gayatri-mantra" }],
      },
      consecutiveFailures: 1,
      checkedAt: NOW.toISOString(),
    };
    const line = goldenAskDigestLine(s, NOW);
    expect(line).toMatch(/1st night/);
    expect(line).not.toMatch(/ALERT/);
  });

  it("digest line ALERTS on second-strike (consecutiveFailures >= 2)", () => {
    const s: StoredGoldenAsk = {
      rollup: {
        ranAt: NOW.toISOString(),
        pass: 15,
        fail: 2,
        p50: 3000,
        p95: 9000,
        cases: [
          { id: "g-001", kind: "grounded", ok: false, ms: 8000, reason: "missing" },
          { id: "s-002", kind: "silence", ok: false, ms: 2000, reason: "hallucinated" },
        ],
      },
      consecutiveFailures: 2,
      checkedAt: NOW.toISOString(),
    };
    const line = goldenAskDigestLine(s, NOW);
    expect(line).toMatch(/ALERT/);
    expect(line).toMatch(/2nd night/);
  });

  it("nextConsecutiveFailures increments on fail, resets to 0 on pass", () => {
    const prevFail: StoredGoldenAsk = {
      rollup: { ranAt: NOW.toISOString(), pass: 16, fail: 1, p50: 0, p95: 0, cases: [] },
      consecutiveFailures: 1,
      checkedAt: NOW.toISOString(),
    };
    const passRollup = { ranAt: NOW.toISOString(), pass: 17, fail: 0, p50: 0, p95: 0, cases: [] };
    const failRollup = { ranAt: NOW.toISOString(), pass: 16, fail: 1, p50: 0, p95: 0, cases: [] };

    expect(nextConsecutiveFailures(prevFail, failRollup)).toBe(2);
    expect(nextConsecutiveFailures(prevFail, passRollup)).toBe(0);
    expect(nextConsecutiveFailures(null, failRollup)).toBe(1);
    expect(nextConsecutiveFailures(null, passRollup)).toBe(0);
  });

  it("GOLDEN_ASK_MAX_AGE_H is 25 (the nightly cadence floor)", () => {
    expect(GOLDEN_ASK_MAX_AGE_H).toBe(25);
  });
});

describe("extractCitationSlugs (live /ask contract)", () => {
  it("extracts slugs from object citations (the current /api/ai/ask contract)", () => {
    const raw = [
      { slug: "gayatri-mantra", section: "warnings", similarity: 1 },
      { slug: "pranava-japa", section: "summary", similarity: 0.8 },
    ];
    expect(extractCitationSlugs(raw)).toEqual(["gayatri-mantra", "pranava-japa"]);
  });

  it("extracts slugs from legacy URL string citations", () => {
    const raw = ["/archive/gayatri-mantra", "/archive/pranava-japa"];
    expect(extractCitationSlugs(raw)).toEqual(["gayatri-mantra", "pranava-japa"]);
  });

  it("extracts slugs from bare slug strings", () => {
    expect(extractCitationSlugs(["gayatri-mantra", "pranava-japa"])).toEqual([
      "gayatri-mantra",
      "pranava-japa",
    ]);
  });

  it("mixed shapes — objects + URL strings + bare slugs", () => {
    const raw = [
      { slug: "gayatri-mantra", section: "summary" },
      "/archive/pranava-japa",
      "yoga-nidra",
    ];
    expect(extractCitationSlugs(raw)).toEqual(["gayatri-mantra", "pranava-japa", "yoga-nidra"]);
  });

  it("skips entries without a slug (malformed object, number, null)", () => {
    const raw = [
      { section: "warnings" }, // no slug
      42,
      null,
      { slug: 123 }, // non-string slug
      { slug: "valid-slug" },
    ];
    expect(extractCitationSlugs(raw)).toEqual(["valid-slug"]);
  });

  it("returns empty array for empty input", () => {
    expect(extractCitationSlugs([])).toEqual([]);
  });
});
