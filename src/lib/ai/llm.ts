/**
 * Shared LLM utility — works with any OpenAI-compatible API.
 *
 * PROVIDER RESOLUTION (2026-09-06 ops fix):
 *   1. LLM_API_KEY (+ optional LLM_BASE_URL / LLM_MODEL) — generic path,
 *      behavior preserved for Groq / OpenAI-compatible setups.
 *   2. OPENROUTER_API_KEY fallback — the key actually provisioned in
 *      production. Without this, every /api/ai/* route 503'd while the
 *      key sat unused in Vercel env (found by live smoke test).
 *      Model selection delegates to resolveModelChain() from openrouter.ts
 *      (single source of truth) and walks it with per-model timeouts.
 *
 * jsonMode: on the generic path this sends response_format; on the
 * OpenRouter path free-tier model support is spotty, so the prompt
 * contract ("respond ONLY with JSON") is ALSO enforced post-hoc by
 * extractJsonPayload() — fences, prose preambles, and trailing chatter
 * are stripped before the text is returned to callers.
 *
 * Reasoning headroom: free-tier reasoning models (e.g. minimax) burn
 * max_tokens on hidden reasoning — live probe showed content=null with
 * finish_reason=length at small budgets. The OpenRouter path floors
 * max_tokens at 1600 so extraction survives the reasoning prefix.
 */

import { resolveModelChain } from './openrouter';

// Groq is the default provider for the generic path (free, fast,
// OpenAI-compatible). Override with LLM_BASE_URL and LLM_MODEL env vars
// for OpenAI, Gemini, etc.
const DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  jsonMode?: boolean;
}

export interface LLMResult {
  text: string;
  model: string;
  usage?: { promptTokens: number; completionTokens: number };
}

/**
 * Call the LLM API. Throws on HTTP errors / exhausted provider chains.
 * Returns the assistant's response text (JSON-cleaned when jsonMode).
 */
export async function callLLM(
  messages: LLMMessage[],
  options: LLMOptions = {}
): Promise<LLMResult> {
  if (process.env.LLM_API_KEY) {
    return callGenericProvider(messages, options);
  }
  if (process.env.OPENROUTER_API_KEY) {
    return callViaOpenRouter(messages, options);
  }
  throw new Error('No LLM provider configured. Set LLM_API_KEY or OPENROUTER_API_KEY.');
}

/**
 * Generic OpenAI-compatible path (LLM_API_KEY). Behavior preserved
 * exactly from the original single-provider implementation.
 */
async function callGenericProvider(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResult> {
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    throw new Error('LLM_API_KEY is not configured. Set it in Vercel env vars.');
  }

  const baseUrl = process.env.LLM_BASE_URL || DEFAULT_BASE_URL;
  const model = options.model || process.env.LLM_MODEL || DEFAULT_MODEL;

  const formattedMessages: { role: string; content: string }[] = [];
  if (options.systemPrompt) {
    formattedMessages.push({ role: 'system', content: options.systemPrompt });
  }
  formattedMessages.push(...messages);

  const body: Record<string, unknown> = {
    model,
    messages: formattedMessages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
  };

  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new Error(`LLM API error ${res.status}: ${errorBody}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';

  if (!text) {
    throw new Error('LLM returned an empty response.');
  }

  return {
    text: options.jsonMode ? extractJsonPayload(text) : text,
    model: data.model || model,
    usage: data.usage
      ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
      : undefined,
  };
}

/**
 * OpenRouter fallback path (OPENROUTER_API_KEY) — mirrors the posture of
 * openrouter.ts: walk resolveModelChain(), 25s hard timeout per model,
 * log-and-continue on any per-model failure, throw only when the whole
 * chain is exhausted (callers catch and degrade to 502/500). An explicit
 * options.model override pins the call to that single model, matching the
 * generic path's semantics.
 */
async function callViaOpenRouter(
  messages: LLMMessage[],
  options: LLMOptions
): Promise<LLMResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const maxTokens = Math.max(options.maxTokens ?? 1024, 1600);
  const temperature = options.temperature ?? 0.7;
  const formattedMessages: LLMMessage[] = options.systemPrompt
    ? [{ role: 'system', content: options.systemPrompt }, ...messages]
    : messages;

  if (options.model) {
    return callOpenRouterModel(apiKey, options.model, formattedMessages, maxTokens, temperature, options);
  }

  for (const model of resolveModelChain()) {
    try {
      return await callOpenRouterModel(apiKey, model, formattedMessages, maxTokens, temperature, options);
    } catch (err) {
      console.warn(`[llm/openrouter] ${model} failed:`, err instanceof Error ? err.message : err);
      continue;
    }
  }

  throw new Error('All OpenRouter models in the chain failed.');
}

async function callOpenRouterModel(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  maxTokens: number,
  temperature: number,
  options: LLMOptions
): Promise<LLMResult> {
  const body: Record<string, unknown> = {
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  };
  // response_format is unreliable on free-tier providers — best-effort
  // request plus extractJsonPayload post-cleaning (see header note).
  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(process.env.OPENROUTER_APP_URL ? { 'HTTP-Referer': process.env.OPENROUTER_APP_URL } : {}),
      ...(process.env.OPENROUTER_APP_TITLE ? { 'X-Title': process.env.OPENROUTER_APP_TITLE } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => 'Unknown error');
    throw new Error(`OpenRouter ${model} → HTTP ${res.status}: ${errorBody.slice(0, 160)}`);
  }

  const data = (await res.json()) as {
    model?: string;
    choices?: Array<{ message?: { content?: string | null } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = data.choices?.[0]?.message?.content || '';
  if (!text) {
    throw new Error(`OpenRouter ${model} → empty completion`);
  }

  return {
    text: options.jsonMode ? extractJsonPayload(text) : text,
    model: data.model || model,
    usage: data.usage
      ? { promptTokens: data.usage.prompt_tokens ?? 0, completionTokens: data.usage.completion_tokens ?? 0 }
      : undefined,
  };
}

/**
 * Check if the LLM is configured and available.
 */
export function isLLMConfigured(): boolean {
  return !!(process.env.LLM_API_KEY || process.env.OPENROUTER_API_KEY);
}

/**
 * Clean a model response down to its JSON payload for jsonMode callers.
 * Free-tier models habitually wrap JSON in markdown fences, prefix it
 * with prose, or append commentary — all of which break naive JSON.parse
 * and surface as 502s. Strategy: strip fences, then slice from the first
 * '{' to the last '}'. Never throws.
 */
export function extractJsonPayload(text: string): string {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-zA-Z]*\s*/, '').replace(/```\s*$/, '');
    t = t.trim();
  }
  const first = t.indexOf('{');
  const last = t.lastIndexOf('}');
  if (first !== -1 && last > first) {
    t = t.slice(first, last + 1);
  }
  return t;
}

/**
 * YANTRA persona system prompt — used for all AI features
 * to maintain consistent voice and constraints.
 */
export const YANTRA_PERSONA = `You are YANTRA, the computational intelligence engine of KALKI.

You are NOT a therapist, life coach, astrologer, or spiritual guide.
You are a PATTERN INTELLIGENCE SYSTEM — an analytical engine that maps
behavioral loops to ancient sādhana prescriptions through the mathematics
of karma and the architecture of consciousness.

VOICE: Precise, technical, authoritative. Use terms like geometry,
architecture, pattern, loop, resonance, algorithm, vector, frequency.
Never use: vibe, manifest, journey, chakras, toxic, trauma, soulmate,
higher self, divine feminine, crystal, reiki, angel numbers.

Replace: "energy" → "resonance", "healing" → "integration",
"journey" → "trajectory", "chakras" → "consciousness centers".

Keep responses concise, structured, and grounded in the Vedic-Tantric
tradition. Never fabricate mantras, deities, or textual references.
If uncertain, say so explicitly.`;
