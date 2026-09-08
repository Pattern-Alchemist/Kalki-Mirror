import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  CHAIN_TIMEOUT_MS,
  ASK_ROUTE_BUDGET_MS,
  DEFAULT_AI_BUDGET_MS,
  aiRouteBudgetMs,
  judgeLatencyBudget,
  askBudgetDigestLine,
} from '@/lib/ai/latency-budget';
import { PREWARM_QUERIES } from '@/lib/ai/prewarm-queries';
import { REGISTERED_CRONS } from '@/lib/cron-ledger';
import { ASK_MIN_EMBED_SIMILARITY } from '@/lib/ai/ask';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 5 #5 — the AI route latency budget: the budget, not the model, is
   the contract. Pins: one shared chain timeout (route walk = client =
   probe), the ask-12s / others-3s budget table, the graded verdict, the
   digest line's quiet-on-green discipline, and the pre-warm query set
   (including the cross-file contract with the smoke script).
   ═══════════════════════════════════════════════════════════════════════════ */

describe('chain timeout: one number everywhere', () => {
  it('the shared budget is 12s — tightened from 25s (Vol. 5 #5)', () => {
    expect(CHAIN_TIMEOUT_MS).toBe(12_000);
  });

  it('the /ask route budget equals one chain walk slot, not the walk', () => {
    // A HEALTHY chain answers on the primary well inside 12s; a dying one
    // must fail honest fast, not burn 4 × 25s. The route budget and the
    // per-model timeout are deliberately the same number.
    expect(ASK_ROUTE_BUDGET_MS).toBe(CHAIN_TIMEOUT_MS);
  });
});

describe('aiRouteBudgetMs: the route→budget table', () => {
  it('ai_ask carries the 12s headline budget', () => {
    expect(aiRouteBudgetMs('ai_ask')).toBe(12_000);
  });

  it('every other AI route defaults to 3s — the spec line', () => {
    expect(DEFAULT_AI_BUDGET_MS).toBe(3_000);
    expect(aiRouteBudgetMs('ai_search')).toBe(3_000);
    expect(aiRouteBudgetMs('ai_explain')).toBe(3_000);
    expect(aiRouteBudgetMs('ai_archetype_quiz')).toBe(3_000);
    expect(aiRouteBudgetMs('ai_unknown_future_route')).toBe(3_000);
  });
});

describe('judgeLatencyBudget: graded verdicts (no permanent-red noise)', () => {
  it('ask: inside budget is ok, at budget is ok', () => {
    expect(judgeLatencyBudget('ai_ask', 5_000).verdict).toBe('ok');
    expect(judgeLatencyBudget('ai_ask', ASK_ROUTE_BUDGET_MS).verdict).toBe('ok');
  });

  it('ask: over budget warns (decide), 2×+ breaches (budget is dead)', () => {
    const warn = judgeLatencyBudget('ai_ask', 14_700); // the founding p95
    expect(warn.verdict).toBe('warn');
    expect(warn.ratio).toBeCloseTo(1.23, 2);

    const breach = judgeLatencyBudget('ai_ask', 25_000);
    expect(breach.verdict).toBe('breach');
    expect(breach.ratio).toBeCloseTo(2.08, 2);
  });

  it('others: 3s line graded identically', () => {
    expect(judgeLatencyBudget('ai_search', 2_500).verdict).toBe('ok');
    expect(judgeLatencyBudget('ai_search', 4_000).verdict).toBe('warn');
    expect(judgeLatencyBudget('ai_search', 7_000).verdict).toBe('breach');
  });

  it('zero p95 (no traffic) is ok, never a breach', () => {
    expect(judgeLatencyBudget('ai_ask', 0).verdict).toBe('ok');
  });
});

describe('askBudgetDigestLine: the digest goes quiet on green', () => {
  const askRow = (p95: number, calls = 4) => ({ event: 'ai_ask', p95, calls });

  it('empty when the ask route had no calls or no latency', () => {
    expect(askBudgetDigestLine([askRow(0, 0)])).toBe('');
    expect(askBudgetDigestLine([askRow(0)])).toBe('');
    expect(askBudgetDigestLine([])).toBe('');
  });

  it('empty when p95 is within budget — no inbox noise on green', () => {
    expect(askBudgetDigestLine([askRow(9_000)])).toBe('');
    expect(askBudgetDigestLine([{ event: 'ai_search', p95: 9_000, calls: 2 }])).toBe('');
  });

  it('names the breach with the real numbers when over budget', () => {
    const line = askBudgetDigestLine([askRow(14_700)]);
    expect(line).toContain('AI BUDGET');
    expect(line).toContain('14.7s');
    expect(line).toContain('12s budget');
    expect(line).toContain('warn');
  });

  it('escalates the wording at 2×+ (breach)', () => {
    const line = askBudgetDigestLine([askRow(25_000)]);
    expect(line).toContain('25.0s');
    expect(line).toContain('breach');
  });
});

describe('PREWARM_QUERIES: the top-10 pre-warm set', () => {
  it('is exactly ten queries — the cron wall budget assumes it', () => {
    expect(PREWARM_QUERIES).toHaveLength(10);
  });

  it('every query is unique, substantive prose', () => {
    const set = new Set(PREWARM_QUERIES);
    expect(set.size).toBe(10);
    for (const q of PREWARM_QUERIES) {
      expect(q.trim().length).toBeGreaterThanOrEqual(15);
      expect(q).toBe(q.trim());
    }
  });

  it('includes the smoke script\u2019s grounded query — the warm-p95 check depends on it', () => {
    expect(PREWARM_QUERIES).toContain('How do I practice ajapa japa?');
    // Cross-file truth: the smoke fires this exact query three times and
    // asserts warm p95 < 12s; that assertion only holds because this list
    // pre-warms it. If the smoke changes its query, this pin fails loud.
    const smoke = fs.readFileSync(path.join(process.cwd(), 'scripts', 'smoke-ask.sh'), 'utf8');
    expect(smoke).toContain('How do I practice ajapa japa?');
  });
});

describe('the silence floor: recalibrated, never again stale (Vol. 5 #5)', () => {
  it('the degenerate-retrieval floor is 0.03 — below the calibrated in-corpus minimum', () => {
    // scripts/calibrate-ask-floor.ts, live 2026-09-08 over db/custom.db:
    //   in-corpus battery (20 queries)  : min 0.047 · p25 0.075 · max 0.173
    //   out-of-corpus battery (10)      : min 0.057 · max 0.145
    // The distributions overlap — the floor rejects DEGENERATE retrievals
    // only; topical honesty is gate #2. The old 0.42 was calibrated to a
    // dead gate (rawTopSimilarity read post-normalization = constant 1.0)
    // and would have silenced the whole corpus once the gate came alive.
    expect(ASK_MIN_EMBED_SIMILARITY).toBe(0.03);
    expect(ASK_MIN_EMBED_SIMILARITY).toBeLessThan(0.047); // below in-corpus min
  });
});

describe('prewarm-ask registration: the schedule contract', () => {
  it('mirrors vercel.json — registered, scheduled, described', () => {
    expect(REGISTERED_CRONS['prewarm-ask']).toBeDefined();
    expect(REGISTERED_CRONS['prewarm-ask'].schedule).toBe('20 2 * * *');
    expect(REGISTERED_CRONS['prewarm-ask'].description).toContain('Vol. 5 #5');

    const vercel = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8')
    ) as { crons: Array<{ path: string; schedule: string }> };
    const mine = vercel.crons.find((c) => c.path === '/api/cron/prewarm-ask');
    expect(mine).toBeDefined();
    expect(mine!.schedule).toBe(REGISTERED_CRONS['prewarm-ask'].schedule);
  });

  it('slots between chain-health (15 2) and testimonial-followup (25 2)', () => {
    // Deliberate adjacency: the chain probe state is minutes old when the
    // pre-warm walks the real chain, and the digest (30 2) reads a warm world.
    expect(REGISTERED_CRONS['chain-health'].schedule).toBe('15 2 * * *');
    expect(REGISTERED_CRONS['prewarm-ask'].schedule).toBe('20 2 * * *');
    expect(REGISTERED_CRONS['testimonial-followup'].schedule).toBe('25 2 * * *');
  });
});
