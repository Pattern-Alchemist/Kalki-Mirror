import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { extractJsonPayload, isLLMConfigured } from '@/lib/ai/llm';

/* ══════════════════════════════════════════════════════════════
   2026-09-06 ops fix — provider resolution + JSON payload cleaning.

   Background: every /api/ai/* route gated on isLLMConfigured(),
   which only knew LLM_API_KEY — a var never provisioned in Vercel.
   Production returned 503 on all AI surfaces while the real key
   (OPENROUTER_API_KEY) sat unused. These tests pin the fixed
   contract: either key configures the engine, and jsonMode
   responses survive free-tier formatting habits.
   ══════════════════════════════════════════════════════════════ */

const ENV_KEYS = ['LLM_API_KEY', 'OPENROUTER_API_KEY'] as const;
let savedEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  savedEnv = {};
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  for (const k of ENV_KEYS) delete process.env[k];
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

describe('isLLMConfigured', () => {
  it('is false when neither provider key is set', () => {
    expect(isLLMConfigured()).toBe(false);
  });

  it('is true with only OPENROUTER_API_KEY — the production-provisioned key', () => {
    process.env.OPENROUTER_API_KEY = 'sk-or-test';
    expect(isLLMConfigured()).toBe(true);
  });

  it('is true with only LLM_API_KEY — generic path unchanged', () => {
    process.env.LLM_API_KEY = 'llama-test';
    expect(isLLMConfigured()).toBe(true);
  });
});

describe('extractJsonPayload', () => {
  it('returns plain JSON untouched', () => {
    expect(extractJsonPayload('{"results":[]}')).toBe('{"results":[]}');
  });

  it('strips markdown code fences with a language tag', () => {
    const raw = '```json\n{"results":[{"slug":"the-rescuer"}]}\n```';
    expect(extractJsonPayload(raw)).toBe('{"results":[{"slug":"the-rescuer"}]}');
  });

  it('strips bare markdown code fences', () => {
    const raw = '```\n{"ok":true}\n```';
    expect(extractJsonPayload(raw)).toBe('{"ok":true}');
  });

  it('slices prose-wrapped JSON from first { to last }', () => {
    const raw = 'Here is the JSON you asked for:\n{"results":[1,2]}\nLet me know if you need more.';
    expect(extractJsonPayload(raw)).toBe('{"results":[1,2]}');
  });

  it('handles nested objects without eating inner braces', () => {
    const raw = '{"a":{"b":1},"c":2}';
    expect(extractJsonPayload(`prefix ${raw} suffix`)).toBe(raw);
  });

  it('never throws on garbage — returns input unchanged when no braces', () => {
    expect(extractJsonPayload('no json here at all')).toBe('no json here at all');
    expect(extractJsonPayload('')).toBe('');
  });

  it('handles the real failure shape: fence + prose + trailing chatter', () => {
    const raw = '```json\nSure! {"results":[{"slug":"the-ghost"}]} — hope this helps!\n```';
    expect(JSON.parse(extractJsonPayload(raw))).toEqual({
      results: [{ slug: 'the-ghost' }],
    });
  });
});
