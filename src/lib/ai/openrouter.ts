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
 *  strictness; scripts/probe methodology). Re-probed 2026-09-15 (2nd sweep) —
 *  inclusionai models back alive, openrouter/free STILL breaching contract.
 *  6 survivors found, 3 distinct pools selected for max diversity:
 *    · poolside/laguna-xs-2.1 — contract PASS 1.3s grounded (fastest, new pool) → primary
 *    · inclusionai/ling-3.0-flash-fin — contract PASS 2.3s grounded → secondary
 *    · inclusionai/ling-3.0-flash-vl — contract PASS 5.0s grounded → tail
 *  openrouter/free DROPPED (breached contract on 3 consecutive probes — the
 *  meta-router is no longer reliable). New survivors also available but over
 *  budget: cohere/north-mini-code (16.7s), nemotron-3-super (24.7s), nex-pro
 *  (13.4s). poolside/laguna-s-2.1 also PASS at 6.2s — could swap in if
 *  laguna-xs rots. nemotron-3-ultra honest_silence at 6.0s — working but silent. */
const DEFAULT_MODELS = [
  "poolside/laguna-xs-2.1:free", // contract PASS 1.3s grounded (2026-09-15 sweep 2)
  "inclusionai/ling-3.0-flash-fin:free", // contract PASS 2.3s grounded (2026-09-15 sweep 2)
  "inclusionai/ling-3.0-flash-vl:free", // contract PASS 5.0s grounded (2026-09-15 sweep 2)
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
