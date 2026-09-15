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
 *  strictness; scripts/probe methodology). Re-probed 2026-09-15 — the
 *  09-09 chain had rotted again: liquid/lfm-2.5-2.6b took 29.3s (over budget),
 *  openrouter/free breached contract (no JSON), gemma-4-31b 429 (still).
 *  19-model sweep found 2 survivors:
 *    · inclusionai/ling-3.0-flash-fin — contract PASS 4.4s grounded → primary
 *    · inclusionai/ling-3.0-flash-vl — contract PASS 10.0s grounded → secondary
 *  Both are the same pool (inclusionai), so pool-diversity is reduced — but
 *  the openrouter/free meta-router stays as the third slot (it routes across
 *  whatever capacity exists; if inclusionai rots, the meta-router finds the
 *  next survivor). The gemma tail is dropped (429 for 72h+ — not recovering).
 *  nex-n2.5-pro (16.4s) passes contract but blows budget — same doctrine as
 *  09-09. dots-3-note (18.4s) same class. */
const DEFAULT_MODELS = [
  "inclusionai/ling-3.0-flash-fin:free", // contract PASS 4.4s grounded (2026-09-15)
  "inclusionai/ling-3.0-flash-vl:free", // contract PASS 10.0s grounded (2026-09-15)
  "openrouter/free", // meta-router — diversity against pool rot
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
