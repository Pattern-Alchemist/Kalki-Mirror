import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { callLLM, extractJsonPayload, isLLMConfigured } from '@/lib/ai/llm';

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

/* ══════════════════════════════════════════════════════════════
   2026-09-09 — the chain walk's CONTRACT GATE. Found live: 3/4
   chain models died within a day of enlistment; the single
   survivor returned off-contract text; the walk (first-non-empty)
   handed it to /ask's strict parser and the route silenced as
   ungrounded_output while a healthy model sat later in the chain.
   The walk now accepts a validate() — a non-empty completion that
   fails it is treated like any other chain failure.
   ══════════════════════════════════════════════════════════════ */
describe('callLLM chain walk — the contract gate', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    saved.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    saved.OPENROUTER_MODELS = process.env.OPENROUTER_MODELS;
    process.env.OPENROUTER_API_KEY = 'sk-or-test';
    process.env.OPENROUTER_MODELS = 'poison-model,clean-model';
  });

  afterEach(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    vi.unstubAllGlobals();
  });

  function completion(model: string, content: string) {
    return {
      ok: true,
      json: async () => ({
        model,
        choices: [{ message: { content }, finish_reason: 'stop' }],
      }),
    };
  }

  it('skips a non-empty completion that fails validate and walks to the clean model', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string | URL, init?: { body?: string }) => {
      const model = JSON.parse(init?.body ?? '{}').model as string;
      if (model === 'poison-model') {
        // The live failure shape: fluent, non-empty, but NOT the JSON contract.
        return completion('poison-model', 'I cannot share that information.');
      }
      return completion('clean-model', '{"cited_folios":["soham-dhyana"],"grounded":true,"answer":"Begin with the breath."}');
    }));

    const result = await callLLM([{ role: 'user', content: 'q' }], {
      systemPrompt: 'contract',
      jsonMode: true,
      validate: (text) => {
        try {
          return JSON.parse(text).grounded === true;
        } catch {
          return false;
        }
      },
    });
    expect(result.model).toBe('clean-model');
    expect(JSON.parse(result.text).grounded).toBe(true);
  });

  it('keeps first-non-empty when no validate is set (legacy posture unchanged)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string | URL, init?: { body?: string }) => {
      const model = JSON.parse(init?.body ?? '{}').model as string;
      if (model === 'poison-model') return completion('poison-model', 'plain prose, no json');
      return completion('clean-model', '{"ok":true}');
    }));

    const result = await callLLM([{ role: 'user', content: 'q' }], { jsonMode: true });
    expect(result.model).toBe('poison-model');
  });

  it('throws the chain-exhausted error when every model fails the contract', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string | URL, init?: { body?: string }) => {
      const model = JSON.parse(init?.body ?? '{}').model as string;
      return completion(model, 'off-contract chatter');
    }));

    await expect(
      callLLM([{ role: 'user', content: 'q' }], {
        jsonMode: true,
        validate: () => false,
      })
    ).rejects.toThrow('All OpenRouter models in the chain failed.');
  });
});
