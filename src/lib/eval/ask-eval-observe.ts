// =============================================================
// KALKI — /ask eval OpsState observer (Vol. 6 #6)
// -------------------------------------------------------------
// Mirrors the chain-health pattern: a single OpsState key holds the
// latest rollup + a consecutive-failures counter; the digest line
// is silent on green, alarm-on-second-strike (free-tier congestion
// must not manufacture alarm fatigue — the ops-day2 record's
// hardcoded-279 health bug caused weeks of false "degraded").
//
// Storage: OpsState row keyed GOLDEN_ASK_OPS_KEY, JSON StoredGoldenAsk.
// Staleness floor: 25h — a probe older than this is treated as no probe.
// 2-strike rule: first fail logs (digest shows a SOFT line); second
//   consecutive fail alarms (digest shows ALERT).
// =============================================================

import type { EvalRollup, CaseVerdict } from './ask-eval';

export const GOLDEN_ASK_OPS_KEY = 'eval:golden_ask';

/** Staleness floor — a probe older than this is treated as no probe. */
export const GOLDEN_ASK_MAX_AGE_H = 25;

export interface StoredGoldenAsk {
  rollup: EvalRollup;
  /** Consecutive nightly failures — resets to 0 on the first pass after a fail. */
  consecutiveFailures: number;
  checkedAt: string; // ISO timestamp (mirrors rollup.ranAt for clarity)
}

export function parseStoredGoldenAsk(raw: string | null | undefined): StoredGoldenAsk | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Partial<StoredGoldenAsk>;
    if (!obj || typeof obj !== 'object') return null;
    if (!obj.rollup || typeof obj.checkedAt !== 'string') return null;
    if (typeof obj.consecutiveFailures !== 'number') return null;
    return {
      rollup: obj.rollup,
      consecutiveFailures: obj.consecutiveFailures,
      checkedAt: obj.checkedAt,
    };
  } catch {
    return null;
  }
}

export function goldenAskAgeHours(s: StoredGoldenAsk | null, now: Date = new Date()): number {
  if (!s || typeof s.checkedAt !== 'string') return Infinity;
  const t = Date.parse(s.checkedAt);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, (now.getTime() - t) / 3_600_000);
}

/**
 * The one-line digest verdict. Empty string = healthy and fresh.
 * SOFT line = first-fail log (digest surfaces but doesn't shout).
 * ALERT line = second-strike alarm or stale > 25h.
 */
export function goldenAskDigestLine(s: StoredGoldenAsk | null, now: Date = new Date()): string {
  if (!s) return 'GOLDEN ASK: never run — trigger /api/cron/ask-eval?finalize=1';
  const age = goldenAskAgeHours(s, now);
  if (age > GOLDEN_ASK_MAX_AGE_H) {
    return `GOLDEN ASK: last run ${Math.round(age)}h ago (> ${GOLDEN_ASK_MAX_AGE_H}h) — eval cron may be dead`;
  }
  const { pass, fail, p95 } = s.rollup;
  if (fail === 0) {
    // healthy and fresh — the digest stays quiet on green
    return '';
  }
  // Failures exist — apply the 2-strike rule.
  const failedCases: CaseVerdict[] = s.rollup.cases.filter((v) => !v.ok);
  const sample = failedCases.slice(0, 2).map((v) => `${v.id}(${v.reason ?? 'fail'})`).join(', ');
  if (s.consecutiveFailures >= 2) {
    return `GOLDEN ASK ALERT: ${fail}/${pass + fail} fail (2nd night) — p95 ${p95}ms — ${sample}`;
  }
  // first-strike: log but don't alarm
  return `GOLDEN ASK: ${fail}/${pass + fail} fail (1st night, watching) — p95 ${p95}ms — ${sample}`;
}

/** Compute the next consecutiveFailures counter from current + new rollup. */
export function nextConsecutiveFailures(current: StoredGoldenAsk | null, newRollup: EvalRollup): number {
  if (newRollup.fail > 0) return (current?.consecutiveFailures ?? 0) + 1;
  return 0; // a pass resets the streak
}
