/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — OpenRouter chat client (Tier-1 ③: YANTRA synthesis)
   ---------------------------------------------------------------------------
   Thin fetch client, zero dependencies, mirrors src/lib/resend.ts posture:

     · Credentials from env only (OPENROUTER_API_KEY) — never inline (G-10).
     · Soft-fail: a missing key, a rate-limited free model, or an outage
       NEVER throws into caller logic — the screener degrades to the
       pattern-based synthesis that predates this module.
     · FALLBACK CHAIN: free-tier models share congested upstream capacity
       (live probes 2026-09-05: minimax-m2.7 OK, glm-5.2/gemma-4 429,
       nemotron 502). So one model is never enough — the client walks the
       chain and returns the first completion. Override with
       OPENROUTER_MODELS (comma-separated) or OPENROUTER_MODEL (primary).
     · 20s hard timeout per model — synthesis must never hang the dossier.
   ═══════════════════════════════════════════════════════════════════════════ */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Default chain — free-tier, JSON-capable, probed live 2026-09-05. */
const DEFAULT_MODELS = [
  "minimax/minimax-m2.7:free",
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free",
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
  const timeoutMs = opts?.timeoutMs ?? 20_000;

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
