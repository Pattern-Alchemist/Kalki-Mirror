// =============================================================
// KALKI — /ask eval pure core (Vol. 6 #6)
// -------------------------------------------------------------
// Judges the outcome of a single /ask probe against a golden case.
// Pure, no network, no DB — the route composes fetch + state, the
// harness composes fetch + memory. Both call the same judge.
//
// CONTRACT (mirror of /api/ai/ask route):
//   grounded  = { grounded: true,  answer, citations: [{slug,...}], model, cached }
//   silence   = { grounded: false, reason: 'corpus_silent' | 'ungrounded_output' }
//
// JUDGE RULES:
//   error                       → fail (the harness reports, never silently passes)
//   grounded case, !out.grounded → fail "expected grounded, got silence"
//   grounded case, missing slug → fail "missing citations: <slug>"
//   silence case, out.grounded  → fail "expected silence, got grounded" (the hallucination net)
//   cache hit                   → pass (latency is the cache's, not the chain's — budget skipped)
//   fresh path, ms > budget     → fail "budget blown"
//   otherwise                   → pass
// =============================================================

import type { GoldenCase } from './golden-set';

export interface AskOutcome {
  grounded: boolean;
  citations: string[];
  ms: number;
  error?: string;
  cached?: boolean;
  /** 'grounded' | 'silence' — set by judge when missing to keep rollup readable */
  kind?: string;
}

export type AskFn = (q: string) => Promise<AskOutcome>;

export interface CaseVerdict {
  id: string;
  kind: string;
  ok: boolean;
  reason?: string;
  ms: number;
  cached?: boolean;
}

export function judge(c: GoldenCase, out: AskOutcome, budgetMs: number): CaseVerdict {
  const base = { id: c.id, kind: c.kind, ms: out.ms, cached: out.cached };
  if (out.error) return { ...base, ok: false, reason: `error: ${out.error}` };

  if (c.kind === 'grounded') {
    if (!out.grounded) return { ...base, ok: false, reason: 'expected grounded, got silence' };
    const missing = c.expectCitations.filter((s) => !out.citations.includes(s));
    if (missing.length) return { ...base, ok: false, reason: `missing citations: ${missing.join(',')}` };
  } else {
    // silence case — a real grounding is a hallucination
    if (out.grounded) return { ...base, ok: false, reason: 'expected honest silence, got grounded' };
  }

  // cache hit: latency is the cache's, not the chain's — budget doesn't apply
  if (out.cached) return { ...base, ok: true };

  if (out.ms > budgetMs) return { ...base, ok: false, reason: `budget blown: ${out.ms}ms > ${budgetMs}ms` };
  return { ...base, ok: true };
}

export interface EvalRollup {
  ranAt: string;
  pass: number;
  fail: number;
  p50: number;
  p95: number;
  cases: CaseVerdict[];
}

export function rollup(cases: CaseVerdict[]): EvalRollup {
  const times = cases.map((v) => v.ms).filter((m) => Number.isFinite(m)).sort((a, b) => a - b);
  const p = (q: number) => (times.length ? times[Math.min(times.length - 1, Math.ceil((q / 100) * times.length) - 1)] : 0);
  return {
    ranAt: new Date().toISOString(),
    pass: cases.filter((v) => v.ok).length,
    fail: cases.filter((v) => !v.ok).length,
    p50: p(50),
    p95: p(95),
    cases,
  };
}
