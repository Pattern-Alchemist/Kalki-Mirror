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
       spans FOUR provider pools (dots-studio, NVIDIA, Google AI Studio,
       Liquid) so one pool's outage never silences the AI layer. Override
       with OPENROUTER_MODELS (comma-separated) or OPENROUTER_MODEL (primary).
     · 12s hard timeout per model (Vol. 5 #5 CHAIN_TIMEOUT_MS — the budget,
       not the model, is the contract; shared with llm.ts and the probe).
   ═══════════════════════════════════════════════════════════════════════════ */

import { CHAIN_TIMEOUT_MS } from './latency-budget';

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Default chain — free-tier, JSON-capable, probed live 2026-09-08 with the
 *  real /ask contract prompt at production size. ling-3.0-flash-sante was
 *  dropped: clean on toy prompts, HTTP 400 on every real-size body. */
const DEFAULT_MODELS = [
  "dots-studio/dots-3-note-preview:free", // non-reasoning primary, JSON-capable, probed PASS
  "nvidia/nemotron-3-ultra-550b-a55b:free", // reasoning-heavy but contract-clean; 1600-token floor protects
  "google/gemma-4-31b-it:free", // best persona quality; congested upstream, recovers on retry
  "liquid/lfm-2.5-2.6b:free", // tiny last resort, probed PASS
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
