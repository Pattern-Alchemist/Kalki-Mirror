/* ═════════════════════════════════════════════════════════════
   AI CHAIN HEALTH — Vol. 5 #1
   -------------------------------------------------------------
   The delisting incident (2026-09-05 → 09-08): two of three
   free-tier models 404-died between probes and production
   /ask degraded silently for days. This module makes that rot
   self-announcing: probe EVERY model in the resolved chain with
   a REAL-SIZE contract prompt (toy prompts lie — ling-sante
   passed a 20-token probe and 400'd every real ask body),
   judge the completion against the strict /ask output contract,
   and report per-model verdict + latency.

   Pure and injectable: the fetcher is a parameter so vitest
   runs the whole verdict matrix without network access.
   ═════════════════════════════════════════════════════════════ */

import { resolveModelChain } from "./openrouter";
import { askSystemPrompt } from "@/lib/ai/ask";
import { CHAIN_TIMEOUT_MS } from "./latency-budget";

export const CHAIN_HEALTH_OPS_KEY = "ai_chain_health";

/** Staleness floor — a probe older than this is treated as no probe. */
export const CHAIN_HEALTH_MAX_AGE_H = 26;

/**
 * Real-size contract probe prompt. Deliberately NOT a toy "reply OK":
 * it is the /ask system prompt plus a representative corpus-chunk body,
 * sized like a small real ask turn (~2KB). Small enough to stay cheap,
 * big enough to catch size-triggered provider 400s.
 */
export function buildChainProbeMessages(): Array<{ role: "system" | "user"; content: string }> {
  const chunk = [
    "[1] slug: pranava-japa · section: summary · caution: OPEN",
    "Pranava japa is the repetition of Om, the pranava. The practice begins",
    "with 21 audible repetitions at dawn, seated, spine erect. Attention rides",
    "the vowel from the navel to the crown; the silence between repetitions",
    "is the seed of the practice. When audible japa steadies, it subsides",
    "into mental repetition, and the repetition becomes self-actuating.",
  ].join("\n");
  return [
    { role: "system", content: askSystemPrompt() },
    {
      role: "user",
      content: `Corpus chunks:\n${chunk}\n\nSeeker's question: "How do I begin pranava japa?"\n\nAnswer per the rules.`,
    },
  ];
}

export interface ModelProbeVerdict {
  model: string;
  ok: boolean;
  /** Contract-valid completion returned */
  reason: "contract_ok" | "http_error" | "empty" | "not_json" | "malformed_contract" | "timeout" | "probe_error";
  latencyMs: number;
  /** HTTP status or provider error code when known */
  status?: number;
  /** Short human detail for the war-room cell */
  detail?: string;
}

export interface ChainHealthReport {
  checkedAt: string;
  models: ModelProbeVerdict[];
  summary: {
    total: number;
    alive: number;
    dead: number;
    /** true when at least one model answers the contract */
    chainOk: boolean;
  };
}

function timeoutSignal(ms: number): AbortSignal | undefined {
  try {
    return AbortSignal.timeout(ms);
  } catch {
    return undefined; // non-Node runtimes without AbortSignal.timeout
  }
}

/**
 * Judge a probe response body against the /ask contract — the same
 * strictness the route applies to real seekers (parseAskOutput), minus
 * the retrieved-slug pool check: the probe asserts the model returns a
 * parseable contract object with a boolean `grounded` (true OR false —
 * an honest silence is a WORKING model; a 404 or a prose blob is not).
 */
export function judgeProbeCompletion(text: string | undefined | null): {
  ok: boolean;
  reason: ModelProbeVerdict["reason"];
  detail?: string;
} {
  if (typeof text !== "string" || text.length === 0) return { ok: false, reason: "empty" };
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
  }
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first === -1 || last <= first) return { ok: false, reason: "not_json", detail: text.slice(0, 80) };
  try {
    const obj = JSON.parse(t.slice(first, last + 1)) as { grounded?: unknown; answer?: unknown; cited_folios?: unknown };
    if (typeof obj !== "object" || obj === null) return { ok: false, reason: "malformed_contract" };
    if (typeof obj.grounded !== "boolean") return { ok: false, reason: "malformed_contract", detail: "grounded not boolean" };
    if (obj.grounded === true && typeof obj.answer !== "string") {
      return { ok: false, reason: "malformed_contract", detail: "grounded=true without answer" };
    }
    if (obj.grounded === true && !Array.isArray(obj.cited_folios)) {
      return { ok: false, reason: "malformed_contract", detail: "grounded=true without cited_folios" };
    }
    return { ok: true, reason: "contract_ok" };
  } catch {
    return { ok: false, reason: "not_json", detail: text.slice(0, 80) };
  }
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/**
 * Probe ONE model: real-size contract prompt, judge the completion.
 * Never throws — every failure mode becomes a verdict.
 */
export async function probeModel(
  model: string,
  opts: { apiKey?: string; timeoutMs?: number; fetchImpl?: FetchLike; maxTokens?: number } = {}
): Promise<ModelProbeVerdict> {
  const apiKey = opts.apiKey ?? process.env.OPENROUTER_API_KEY;
  const started = Date.now();
  if (!apiKey) {
    return { model, ok: false, reason: "probe_error", latencyMs: 0, detail: "OPENROUTER_API_KEY not set" };
  }
  const doFetch = opts.fetchImpl ?? fetch;
  // Vol. 5 #5: the probe shares the route's CHAIN_TIMEOUT_MS — a model that
  // cannot answer inside the route budget must probe as unusable, so the
  // probe verdict and route reality can never disagree.
  const timeoutMs = opts.timeoutMs ?? CHAIN_TIMEOUT_MS;
  try {
    const res = await doFetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: buildChainProbeMessages(),
        max_tokens: opts.maxTokens ?? 800,
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: timeoutSignal(timeoutMs),
    } as RequestInit);
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const isDelisted = res.status === 404;
      return {
        model,
        ok: false,
        reason: "http_error",
        status: res.status,
        latencyMs,
        detail: isDelisted
          ? "delisted/unavailable (404)"
          : `HTTP ${res.status}: ${body.slice(0, 120)}`,
      };
    }
    const data = (await res.json().catch(() => null)) as
      | { choices?: Array<{ message?: { content?: string | null } }> }
      | null;
    const verdict = judgeProbeCompletion(data?.choices?.[0]?.message?.content);
    return { model, latencyMs, ...verdict, ...(verdict.ok ? {} : { detail: verdict.detail }) };
  } catch (err) {
    const latencyMs = Date.now() - started;
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes("timeout") || msg.includes("Timeout") || msg.includes("abort");
    return { model, ok: false, reason: isTimeout ? "timeout" : "probe_error", latencyMs, detail: msg.slice(0, 120) };
  }
}

/**
 * Probe the WHOLE resolved chain — every model, in parallel (worst case
 * is the slowest model, not the sum), then aggregate.
 */
export async function probeChain(
  opts: { apiKey?: string; timeoutMs?: number; fetchImpl?: FetchLike; models?: string[] } = {}
): Promise<ChainHealthReport> {
  const models = opts.models ?? resolveModelChain();
  const verdicts = await Promise.all(
    models.map((m) => probeModel(m, { apiKey: opts.apiKey, timeoutMs: opts.timeoutMs, fetchImpl: opts.fetchImpl }))
  );
  const alive = verdicts.filter((v) => v.ok).length;
  return {
    checkedAt: new Date().toISOString(),
    models: verdicts,
    summary: {
      total: verdicts.length,
      alive,
      dead: verdicts.length - alive,
      chainOk: alive > 0,
    },
  };
}

/* ── OpsState interop (read side lives in the consumers) ──────────────── */

/** Parse a stored ai_chain_health OpsState value; null when absent/corrupt. */
export function parseStoredChainHealth(raw: string | null | undefined): ChainHealthReport | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as ChainHealthReport;
    if (!obj || typeof obj !== "object" || !Array.isArray(obj.models) || !obj.summary) return null;
    return obj;
  } catch {
    return null;
  }
}

/** Age of a report in hours; Infinity for corrupt/missing timestamps. */
export function chainHealthAgeHours(report: ChainHealthReport | null, now: Date = new Date()): number {
  if (!report || typeof report.checkedAt !== "string") return Infinity;
  const t = Date.parse(report.checkedAt);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, (now.getTime() - t) / 3_600_000);
}

/**
 * The one-line digest verdict. Empty string = healthy and fresh (the
 * digest stays quiet on green); anything else is an alert line.
 */
export function chainHealthDigestLine(report: ChainHealthReport | null, now: Date = new Date()): string {
  if (!report) return "AI CHAIN: never probed — run /api/cron/chain-health";
  const age = chainHealthAgeHours(report, now);
  if (age > CHAIN_HEALTH_MAX_AGE_H) {
    return `AI CHAIN: last probe ${Math.round(age)}h ago (> ${CHAIN_HEALTH_MAX_AGE_H}h) — probe cron may be dead`;
  }
  if (!report.summary.chainOk) {
    return `AI CHAIN: DOWN — 0/${report.summary.total} models answer the contract`;
  }
  if (report.summary.dead > 0) {
    const dead = report.models.filter((m) => !m.ok).map((m) => m.model.split("/")[1] ?? m.model).join(", ");
    return `AI CHAIN: degraded — ${report.summary.alive}/${report.summary.total} alive (dead: ${dead})`;
  }
  return "";
}
