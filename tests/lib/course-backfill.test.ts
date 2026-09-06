import { describe, it, expect } from 'vitest';
import {
  computeDueDoors,
  shouldSendCompletion,
  BACKFILL_WINDOW_DAYS,
  BACKFILL_PER_SUBSCRIBER_CAP,
} from '@/lib/emails/course-send';

/**
 * Vol. 3 #9 — missed-Door backfill.
 *
 * The EmailSend ledger is now the course progression state: a Door is due
 * when it is unlogged inside the lookback window and under the caps. These
 * tests pin the three safety properties that make backfill safe:
 *   1. the healthy daily path is UNCHANGED (exactly today's door),
 *   2. the lookback window keeps pre-ledger / long-gone gaps historical,
 *   3. caps prevent burst re-sends.
 */
describe('computeDueDoors — healthy daily path unchanged', () => {
  it('day N with doors 1..N-1 all logged sends exactly door N', () => {
    expect(computeDueDoors(5, [1, 2, 3, 4])).toEqual([5]);
    expect(computeDueDoors(1, [])).toEqual([1]);
    expect(computeDueDoors(10, [1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([10]);
  });

  it('day 0 sends nothing — the welcome email already went out', () => {
    expect(computeDueDoors(0, [])).toEqual([]);
  });

  it('a fully-walked course sends nothing', () => {
    expect(computeDueDoors(15, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual([]);
  });
});

describe('computeDueDoors — catch-up', () => {
  it('a missed run heals oldest-first, within the per-subscriber cap', () => {
    // days 3 and 4 missed: both due tonight, oldest first
    expect(computeDueDoors(5, [1, 2])).toEqual([3, 4]);
    // today's door waits for the next run (cap 2)
    expect(computeDueDoors(5, [1, 2])).not.toContain(5);
  });

  it('a two-night outage heals in two runs', () => {
    const first = computeDueDoors(6, [1, 2, 3]);
    expect(first).toEqual([4, 5]);
    const second = computeDueDoors(6, [1, 2, 3, 4, 5]);
    expect(second).toEqual([6]);
  });

  it('gaps older than the window are historical, never re-sent', () => {
    expect(computeDueDoors(8, [])).toEqual([6, 7]); // doors 1–5 stay history
    expect(BACKFILL_WINDOW_DAYS).toBe(3);
  });

  it('pre-ledger subscribers (day far past, empty ledger) get nothing', () => {
    expect(computeDueDoors(30, [])).toEqual([]);
    expect(computeDueDoors(99, [])).toEqual([]);
  });

  it('per-subscriber cap defaults to 2 and is overridable', () => {
    expect(BACKFILL_PER_SUBSCRIBER_CAP).toBe(2);
    expect(computeDueDoors(5, [], { perSubscriberCap: 3 })).toEqual([3, 4, 5]);
  });

  it('window is overridable for tests and future tuning', () => {
    expect(computeDueDoors(8, [], { windowDays: 8 })).toEqual([1, 2]);
  });

  it('never emits out-of-range doors', () => {
    const due = computeDueDoors(10, [10]);
    expect(due.every((d) => d >= 1 && d <= 10)).toBe(true);
  });
});

describe('shouldSendCompletion — once ever, within the window', () => {
  it('fires on day 11 when never sent', () => {
    expect(shouldSendCompletion(11, false)).toBe(true);
  });

  it('does not double-send', () => {
    expect(shouldSendCompletion(11, true)).toBe(false);
    expect(shouldSendCompletion(12, true)).toBe(false);
  });

  it('fires late within the window, then goes silent', () => {
    expect(shouldSendCompletion(13, false)).toBe(true); // 11 + 3 - 1
    expect(shouldSendCompletion(14, false)).toBe(false); // historical
  });

  it('day 10 is still course time, not completion time', () => {
    expect(shouldSendCompletion(10, false)).toBe(false);
  });
});
