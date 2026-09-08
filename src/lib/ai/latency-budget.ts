/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — AI route latency budget (Vol. 5 #5)
   ---------------------------------------------------------------------------
   The founding number of this item: ai_ask p95 was 14.7s in war-room while
   the chain walked 404→404→429 on dead free-tier models. The route worked;
   the budget did not. Two decisions land here:

     · CHAIN_TIMEOUT_MS = 12_000 — the per-model hard timeout for EVERY
       OpenRouter call path (llm.ts chain walk, openrouter.ts client, and
       the chain-health probe). The budget, not the model, is the contract:
       a model that needs more than 12s to answer the real-size /ask
       contract is unusable in production, so the probe must judge it
       unusable too (probe and route now share one number — a model that
       passes the probe can never time out in the route, and vice versa).
     · Per-route p95 budgets — ai_ask gets 12s (cold LLM synthesis on a
       healthy primary chain fits; a cache hit is ~100ms); every other AI
       route gets 3s per the Vol. 5 spec. LLM-backed routes may honestly
       run over the 3s line on the free chain — the breach is a SIGNAL,
       not a failure: it makes the cost of every route visible so the
       founder can decide (cache it, tighten it, or drop it), and the
       digest only pages on the headline metric (ai_ask over its budget).

   Pure module — no I/O — so vitest can pin the grading exactly.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Per-model hard timeout shared by the route walk, the standalone client
 *  and the chain-health probe (the budget is the contract, Vol. 5 #5). */
export const CHAIN_TIMEOUT_MS = 12_000;

/** The /ask budget: p95 warm, post-deploy smoke asserts it externally. */
export const ASK_ROUTE_BUDGET_MS = 12_000;

/** Every other AI route: the spec's 3s line. Breaches are signals. */
export const DEFAULT_AI_BUDGET_MS = 3_000;

/** The route→budget contract. Routes not listed take DEFAULT_AI_BUDGET_MS. */
export const AI_ROUTE_BUDGETS: Record<string, number> = {
  ai_ask: ASK_ROUTE_BUDGET_MS,
};

export function aiRouteBudgetMs(event: string): number {
  return AI_ROUTE_BUDGETS[event] ?? DEFAULT_AI_BUDGET_MS;
}

export type BudgetVerdict = "ok" | "warn" | "breach";

export interface LatencyBudgetJudgement {
  budgetMs: number;
  /** p95 ÷ budget — 0.5 means half the budget spent, 2 means double it. */
  ratio: number;
  /** ok ≤ 1× budget · warn ≤ 2× (drifting, decide soon) · breach > 2× (the budget is dead) */
  verdict: BudgetVerdict;
}

/**
 * Judge a route's p95 (ms) against its budget. Graded on purpose: a
 * permanently-red panel is alarm fatigue, so a route merely OVER budget
 * is `warn` (the signal the founder sees and decides on), and only a
 * route at 2×+ budget is `breach` (the budget has stopped being real).
 */
export function judgeLatencyBudget(event: string, p95Ms: number): LatencyBudgetJudgement {
  const budgetMs = aiRouteBudgetMs(event);
  const ratio = budgetMs > 0 ? p95Ms / budgetMs : 0;
  const verdict: BudgetVerdict = ratio > 2 ? "breach" : ratio > 1 ? "warn" : "ok";
  return { budgetMs, ratio: Math.round(ratio * 100) / 100, verdict };
}

/**
 * The one-line digest verdict for the /ask budget. Empty = within budget
 * (the digest goes quiet on green). Reads the ai_ask rollup, not the raw
 * events — the same number the war-room renders.
 */
export function askBudgetDigestLine(
  routes: ReadonlyArray<{ event: string; p95: number; calls: number }>,
): string {
  const ask = routes.find((r) => r.event === "ai_ask");
  if (!ask || ask.calls === 0 || ask.p95 <= 0) return "";
  const j = judgeLatencyBudget("ai_ask", ask.p95);
  if (j.verdict === "ok") return "";
  const secs = (ask.p95 / 1000).toFixed(1);
  const budgetSecs = (j.budgetMs / 1000).toFixed(0);
  return `AI BUDGET: ai_ask p95 ${secs}s over its ${budgetSecs}s budget (${j.verdict}) — check the chain panel; a dying chain burns timeouts before any model answers`;
}
