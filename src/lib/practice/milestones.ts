/* =============================================================
   KALKI — SĀDHANA STREAK MILESTONES (Vol. 3 #15)
   Streaks are computed in practice/actions.ts (currentStreak /
   longestStreak from PracticeSession days) but were never
   surfaced as anything a seeker can aim at or share. This
   module makes the numbers MEAN something: the four classical
   gates of sustained sādhana.

   Pure + test-pinned; the UI consumes it from /practice.
   Progress is measured from the previous gate (base-relative),
   so the bar always answers "how far to the NEXT gate", never
   "how far since zero".
   ============================================================= */

export interface Milestone {
  days: number;
  title: string;
  sanskrit?: string;
  note: string;
}

export const MILESTONES: readonly Milestone[] = [
  {
    days: 7,
    title: "The Spark Holds",
    sanskrit: "Sapta-dina",
    note: "One full week of uninterrupted practice. The first gate — most minds quit here.",
  },
  {
    days: 21,
    title: "The Loop Reforged",
    note: "Three weeks. The old default has lost its grip; the new groove is carved.",
  },
  {
    days: 41,
    title: "Puraścaraṇa",
    sanskrit: "Catvāriṃśat-dina",
    note: "The classical 41-day minimum of a full puraścaraṇa cycle.",
  },
  {
    days: 99,
    title: "The Ninety-Nine",
    note: "Practice is no longer something you do. It is what you are.",
  },
] as const;

export const MILESTONE_THRESHOLDS: readonly number[] = MILESTONES.map((m) => m.days);

/** Every gate the streak has reached, in ascending order. */
export function milestonesReached(streak: number): Milestone[] {
  if (!Number.isFinite(streak) || streak <= 0) return [];
  return MILESTONES.filter((m) => streak >= m.days);
}

/** The next gate ahead — null once all four are behind you. */
export function nextMilestone(streak: number): Milestone | null {
  if (!Number.isFinite(streak) || streak < 0) return null;
  return MILESTONES.find((m) => streak < m.days) ?? null;
}

export interface MilestoneProgress {
  /** Next gate (undefined-safe: only returned when one exists). */
  milestone: Milestone;
  daysRemaining: number;
  /** 0–100, measured from the previous gate to the next. */
  pct: number;
}

/**
 * Base-relative progress toward the next gate.
 * Before gate 1 the base is 0; between gates the base is the
 * last reached gate. At/after the final gate: null.
 */
export function milestoneProgress(streak: number): MilestoneProgress | null {
  const next = nextMilestone(streak);
  if (!next) return null;
  const reached = milestonesReached(streak);
  const base = reached.length > 0 ? reached[reached.length - 1].days : 0;
  const span = next.days - base;
  const done = streak - base;
  const pct = Math.max(0, Math.min(100, Math.round((done / span) * 100)));
  return { milestone: next, daysRemaining: next.days - streak, pct };
}

/** Shareable, honest, no-claim text for the milestone card. */
export function milestoneShareText(streak: number): string {
  const next = nextMilestone(streak);
  if (streak <= 0) {
    return "Day zero. The practice begins where the excuse ends.";
  }
  if (!next) {
    return `${streak} days of uninterrupted sādhana — every gate of the practice has opened.`;
  }
  return `${streak} days of uninterrupted sādhana — ${next.days - streak} more to the ${next.days}-day gate.`;
}
