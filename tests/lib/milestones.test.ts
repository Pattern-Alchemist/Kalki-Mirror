import { describe, expect, it } from "vitest";
import {
  MILESTONES,
  MILESTONE_THRESHOLDS,
  milestonesReached,
  nextMilestone,
  milestoneProgress,
  milestoneShareText,
} from "@/lib/practice/milestones";

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #15 — streak milestones. The gates (7/21/41/99) are
   classical sadhana numbers; boundaries must be exact because
   the /practice card tells a seeker "1 more day" off this math.
   ══════════════════════════════════════════════════════════════ */

describe("milestone constants", () => {
  it("carries the four classical gates in ascending order", () => {
    expect(MILESTONE_THRESHOLDS).toEqual([7, 21, 41, 99]);
    expect(MILESTONES.every((m) => m.title.length > 0)).toBe(true);
    expect(MILESTONES.every((m) => m.note.length > 0)).toBe(true);
  });
});

describe("milestonesReached", () => {
  it("empty below and at zero", () => {
    expect(milestonesReached(0)).toEqual([]);
    expect(milestonesReached(-3)).toEqual([]);
    expect(milestonesReached(NaN)).toEqual([]);
  });

  it("boundary-exact at each gate", () => {
    expect(milestonesReached(6)).toEqual([]);
    expect(milestonesReached(7).map((m) => m.days)).toEqual([7]);
    expect(milestonesReached(20).map((m) => m.days)).toEqual([7]);
    expect(milestonesReached(21).map((m) => m.days)).toEqual([7, 21]);
    expect(milestonesReached(41).map((m) => m.days)).toEqual([7, 21, 41]);
    expect(milestonesReached(98).map((m) => m.days)).toEqual([7, 21, 41]);
    expect(milestonesReached(99).map((m) => m.days)).toEqual([7, 21, 41, 99]);
  });

  it("saturates past the final gate", () => {
    expect(milestonesReached(150)).toHaveLength(4);
  });
});

describe("nextMilestone", () => {
  it("returns the first gate for beginners", () => {
    expect(nextMilestone(0)?.days).toBe(7);
    expect(nextMilestone(6)?.days).toBe(7);
  });

  it("walks the ladder", () => {
    expect(nextMilestone(7)?.days).toBe(21);
    expect(nextMilestone(30)?.days).toBe(41);
    expect(nextMilestone(41)?.days).toBe(99);
  });

  it("returns null at and past the final gate", () => {
    expect(nextMilestone(99)).toBeNull();
    expect(nextMilestone(120)).toBeNull();
  });
});

describe("milestoneProgress (base-relative)", () => {
  it("measures from zero before the first gate", () => {
    const p = milestoneProgress(0);
    expect(p?.milestone.days).toBe(7);
    expect(p?.pct).toBe(0);
    expect(p?.daysRemaining).toBe(7);

    const p3 = milestoneProgress(3);
    expect(p3?.pct).toBe(43); // 3/7 → 43%
  });

  it("measures from the previous gate between gates", () => {
    // Between 41 and 99: span 58, at 48 → (48-41)/58 = 12%.
    const p = milestoneProgress(48);
    expect(p?.milestone.days).toBe(99);
    expect(p?.daysRemaining).toBe(51);
    expect(p?.pct).toBe(12);

    // 98/99: one day out, 98% of the way from 41.
    const p98 = milestoneProgress(98);
    expect(p98?.daysRemaining).toBe(1);
    expect(p98?.pct).toBe(98);
  });

  it("clamps to 0..100 and returns null past the ladder", () => {
    expect(milestoneProgress(99)).toBeNull();
    expect(milestoneProgress(120)).toBeNull();
    expect(milestoneProgress(-1)).toBeNull();
  });
});

describe("milestoneShareText", () => {
  it("honest at day zero", () => {
    expect(milestoneShareText(0)).toMatch(/day zero/i);
  });

  it("names the next gate mid-climb", () => {
    const s = milestoneShareText(17);
    expect(s).toContain("17 days");
    expect(s).toContain("21-day gate");
    expect(s).toContain("4 more");
  });

  it("declares completion past 99", () => {
    expect(milestoneShareText(100)).toMatch(/every gate/);
  });
});
