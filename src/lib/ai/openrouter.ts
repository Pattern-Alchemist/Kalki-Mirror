/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — OpenRouter chat client (Tier-1 ③: YANTRA synthesis)
   ---------------------------------------------------------------------------
   Thin fetch client, zero dependencies, mirrors src/lib/resend.ts posture:

     · Credentials from env only (OPENROUTER_API_KEY) — never inline (G-10).
     · Soft-fail: a missing key, a rate-limited free model, or an outage
       NEVER throws into caller logic — the screener degrades to the
       pattern-based synthesis that predates this module.
     · FALLBACK CHAIN: free-tier models share congested upstream capacity,
       and OpenRouter DELISTS free tiers without notice (live probes
       2026-09-08: minimax-m2.7 and glm-5.2 free tiers 404-dead within 72h
       of enlistment; production /api/ai/ask degraded to total chain
       failure until this swap). One model is never enough — the client
       walks the chain and returns the first completion. The default chain
       spans THREE distinct pools (Liquid, the OpenRouter meta-router, and
       Google AI Studio) so one pool's outage never silences the AI layer.
       Override with OPENROUTER_MODELS (comma-separated) or OPENROUTER_MODEL
       (primary).
     · 12s hard timeout per model (Vol. 5 #5 CHAIN_TIMEOUT_MS — the budget,
       not the model, is the contract; shared with llm.ts and the probe).
   ═══════════════════════════════════════════════════════════════════════════ */

import { CHAIN_TIMEOUT_MS } from './latency-budget';

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Default chain — free-tier, JSON-capable, probed at CONTRACT size (the real
 *  /ask system prompt + real corpus chunks, 12s budget, parseAskOutput
 *  strictness; scripts/probe methodology). Re-probed 2026-09-09 — the 09-08
 *  chain had rotted within a day: dots-3-note burns its whole token floor on
 *  hidden reasoning (finish=length, no content), nemotron-3-ultra answers
 *  grounded=false at real size, the Google pool sat hard behind 429, and the
 *  only then-alive model (liquid) failed the route's strict parse while the
 *  walk kept handing it the contract. Survivors of the 18-model sweep:
 *    · liquid/lfm-2.5-2.6b — contract PASS 8.4s (also PASS 09-08) → primary
 *    · openrouter/free — the meta-router, PASS 11.0s; routes across whatever
 *      capacity exists, one failure mode away from any single pool
 *    · google/gemma-4-31b — fast-fail slot: 429 answers in ~100ms and the
 *      pool historically recovers; kept as tail, not head
 *  nex-n2.5-mini/pro (24–92s) and nemotron-3-super (39s) passed the contract
 *  but blow the 12s budget — unusable by doctrine (#5: the budget is the
 *  contract, probe and route share one number). ling pair still 400 at real
 *  size; inkling pair 403 agentic-only; laguna-xs silent with reasoning on. */
const DEFAULT_MODELS = [
  "liquid/lfm-2.5-2.6b:free", // contract PASS 8.4s at real size, two probes running
  "openrouter/free", // meta-router, PASS 11.0s — diversity against pool rot
  "google/gemma-4-31b-it:free", // best persona; 429 today (fast-fail), recovers on retry
];

export function resolveModelChain(): string[] {
  const custom = (process.env.OPENROUTER_MODELS ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  if (custom.length > 0) return custom;
  const primary = process.env.OPENROUTER_MODEL?.trim();
  if (primary && !DEFAULT_MODELS.includes(primary)) return [primary, ...DEFAULT_MODELS];
  return DEFAULT_MODELS;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatResult {
  ok: boolean;
  content?: string;
  model?: string;
  skipped?: boolean; // no key configured — caller should fall back silently
  error?: string;
}

export async function chatComplete(
  messages: ChatMessage[],
  opts?: { maxTokens?: number; temperature?: number; timeoutMs?: number }
): Promise<ChatResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, error: "OPENROUTER_API_KEY not set" };
  }

  const maxTokens = opts?.maxTokens ?? 700;
  const temperature = opts?.temperature ?? 0.6;
  const timeoutMs = opts?.timeoutMs ?? CHAIN_TIMEOUT_MS;

  for (const model of resolveModelChain()) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Optional attribution headers per OpenRouter docs — harmless if unset.
          ...(process.env.OPENROUTER_APP_URL ? { "HTTP-Referer": process.env.OPENROUTER_APP_URL } : {}),
          ...(process.env.OPENROUTER_APP_TITLE ? { "X-Title": process.env.OPENROUTER_APP_TITLE } : {}),
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        const body = await res.text();
        console.warn(`[openrouter] ${model} → HTTP ${res.status}: ${body.slice(0, 160)}`);
        continue; // next model in the chain
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.warn(`[openrouter] ${model} → empty completion`);
        continue;
      }
      return { ok: true, content, model };
    } catch (err) {
      console.warn(`[openrouter] ${model} → threw:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  return { ok: false, error: "all models in the chain failed" };
}
