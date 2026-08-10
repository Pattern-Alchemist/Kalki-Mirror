/**
 * Shared LLM utility — works with any OpenAI-compatible API.
 * 
 * Supports: OpenAI, Groq, Together AI, OpenRouter, local LLMs.
 * Set LLM_API_KEY and optionally LLM_BASE_URL in env.
 * 
 * Default model: gpt-4o-mini (fast, cheap, good enough for most tasks).
 * Override with LLM_MODEL env var.
 */

// Groq is the default provider (free, fast, OpenAI-compatible).
// Override with LLM_BASE_URL and LLM_MODEL env vars for OpenAI, Gemini, etc.
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
 * Call the LLM API. Throws on HTTP errors.
 * Returns the assistant's response text.
 */
export async function callLLM(
  messages: LLMMessage[],
  options: LLMOptions = {}
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
  return {
    text: data.choices?.[0]?.message?.content || '',
    model: data.model || model,
    usage: data.usage
      ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens }
      : undefined,
  };
}

/**
 * Check if the LLM is configured and available.
 */
export function isLLMConfigured(): boolean {
  return !!process.env.LLM_API_KEY;
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
