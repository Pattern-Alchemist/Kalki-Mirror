import { describe, it, expect } from 'vitest';
import {
  isCorpusSilent,
  patternSlugsMentioned,
  buildAskMessages,
  parseAskOutput,
  buildCitations,
  askSystemPrompt,
  ASK_MIN_EMBED_SIMILARITY,
  ASK_MIN_KEYWORD_SCORE,
  ASK_TOP_K,
  type AskResult,
} from '@/lib/ai/ask';
import { askCacheKey } from '@/lib/ai/ask-cache';
import { synthesisCacheKey } from '@/lib/ai/synthesis-cache';
import { aiAskSchema } from '@/lib/validators/schemas';
import type { RetrievedChunk } from '@/lib/rag/types';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 4 #14 — public grounded Q&A: corpus-or-silence gates, strict output
   parsing, citation validation, and cache-bucket isolation.
   ═══════════════════════════════════════════════════════════════════════════ */

function chunk(overrides: Partial<RetrievedChunk>): RetrievedChunk {
  return { slug: 'pranava-japa', section: 'summary', caution: 'OPEN', text: '…', similarity: 1, ...overrides };
}

describe('corpus-or-silence gate', () => {
  it('thresholds are method-aware constants', () => {
    expect(ASK_MIN_EMBED_SIMILARITY).toBeGreaterThan(0);
    expect(ASK_MIN_EMBED_SIMILARITY).toBeLessThan(1);
    expect(ASK_MIN_KEYWORD_SCORE).toBeGreaterThanOrEqual(2);
    expect(ASK_TOP_K).toBeGreaterThanOrEqual(4);
  });

  it('embedding method: silence below the cosine floor, ground at or above it', () => {
    expect(isCorpusSilent(ASK_MIN_EMBED_SIMILARITY - 0.01, 'embedding')).toBe(true);
    expect(isCorpusSilent(ASK_MIN_EMBED_SIMILARITY, 'embedding')).toBe(false);
    expect(isCorpusSilent(0.9, 'embedding')).toBe(false);
  });

  it('keyword method: silence below the term-hit floor', () => {
    expect(isCorpusSilent(ASK_MIN_KEYWORD_SCORE - 1, 'keyword')).toBe(true);
    expect(isCorpusSilent(ASK_MIN_KEYWORD_SCORE, 'keyword')).toBe(false);
  });
});

describe('patternSlugsMentioned (bridge pre-detection)', () => {
  it('matches a pattern by display name, case-insensitive', () => {
    const hits = patternSlugsMentioned('I am a chronic perfectionist at work');
    expect(hits).toContain('the-perfectionist');
  });

  it('matches by slug words', () => {
    const hits = patternSlugsMentioned('the rescuer in me keeps saving people');
    expect(hits).toContain('the-rescuer');
  });

  it('returns empty for no mention, empty input, and garbage', () => {
    expect(patternSlugsMentioned('what is pranava japa?')).toEqual([]);
    expect(patternSlugsMentioned('')).toEqual([]);
    expect(patternSlugsMentioned('   ')).toEqual([]);
  });
});

describe('buildAskMessages', () => {
  it('embeds every chunk with slug, section, caution, and the seeker question', () => {
    const chunks = [
      chunk({ slug: 'pranava-japa', section: 'summary', caution: 'OPEN' }),
      chunk({ slug: 'trataka', section: 'lineage', caution: 'OPEN' }),
    ];
    const msgs = buildAskMessages('What is trataka?', chunks);
    expect(msgs).toHaveLength(1);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toContain('slug: pranava-japa · section: summary · caution: OPEN');
    expect(msgs[0].content).toContain('slug: trataka · section: lineage · caution: OPEN');
    expect(msgs[0].content).toContain('What is trataka?');
  });

  it('the system prompt carries the grounding hard rules', () => {
    const sys = askSystemPrompt();
    expect(sys).toMatch(/ONLY from the provided chunks/i);
    expect(sys).toMatch(/cited_folios/);
    expect(sys).toMatch(/grounded/);
  });
});

describe('parseAskOutput (strict grounding contract)', () => {
  const retrieved = ['pranava-japa', 'trataka', 'soham-dhyana'];

  it('accepts a well-formed grounded answer and dedupes citations', () => {
    const out = parseAskOutput(
      JSON.stringify({ grounded: true, cited_folios: ['pranava-japa', 'pranava-japa', 'trataka'], answer: ' The corpus teaches… ' }),
      retrieved,
    );
    expect(out).toEqual({ answer: 'The corpus teaches…', citedSlugs: ['pranava-japa', 'trataka'] });
  });

  it('rejects unparseable JSON', () => {
    expect(parseAskOutput('not json at all', retrieved)).toBeNull();
  });

  it('rejects grounded=false — the model choosing silence is silence, not an answer', () => {
    expect(
      parseAskOutput(JSON.stringify({ grounded: false, cited_folios: [], answer: '' }), retrieved),
    ).toBeNull();
  });

  it('rejects empty answers and missing/empty citation lists', () => {
    expect(parseAskOutput(JSON.stringify({ grounded: true, cited_folios: ['pranava-japa'], answer: '   ' }), retrieved)).toBeNull();
    expect(parseAskOutput(JSON.stringify({ grounded: true, cited_folios: [], answer: 'x' }), retrieved)).toBeNull();
    expect(parseAskOutput(JSON.stringify({ grounded: true, answer: 'x' }), retrieved)).toBeNull();
  });

  it('rejects ANY citation outside the retrieved set — the model cannot cite what it never saw', () => {
    expect(
      parseAskOutput(
        JSON.stringify({ grounded: true, cited_folios: ['pranava-japa', ' fabricated-folio '], answer: 'x' }),
        retrieved,
      ),
    ).toBeNull();
    expect(parseAskOutput(JSON.stringify({ grounded: true, cited_folios: [42], answer: 'x' }), retrieved)).toBeNull();
  });
});

describe('buildCitations', () => {
  it('attaches section + similarity in the model citation order, skipping unknowns', () => {
    const chunks = [
      chunk({ slug: 'trataka', section: 'lineage', similarity: 0.8 }),
      chunk({ slug: 'pranava-japa', section: 'summary', similarity: 0.9 }),
    ];
    const out = buildCitations(['pranava-japa', 'trataka'], chunks);
    expect(out).toEqual([
      { slug: 'pranava-japa', section: 'summary', similarity: 0.9 },
      { slug: 'trataka', section: 'lineage', similarity: 0.8 },
    ]);
  });
});

describe('ask cache bucket (SynthesisCache reuse)', () => {
  it('the ask key never collides with a yantra synthesis key for the same query', () => {
    const askKey = askCacheKey('pranava japa benefits', ['pranava-japa']);
    const yantraKey = synthesisCacheKey({
      behavioralQuery: 'pranava japa benefits',
      patterns: [],
      folioSlugs: ['pranava-japa'],
      tier: 'prithvi',
    });
    expect(askKey).not.toEqual(yantraKey);
    expect(askKey).toMatch(/^[0-9a-f]{64}$/);
  });

  it('the key is sensitive to the retrieved folio set (retrieval drift → new key)', () => {
    expect(askCacheKey('q', ['a', 'b'])).not.toEqual(askCacheKey('q', ['a', 'c']));
  });
});

describe('aiAskSchema', () => {
  it('bounds the query like every AI surface (3..500)', () => {
    expect(aiAskSchema.safeParse({ query: 'ab' }).success).toBe(false);
    expect(aiAskSchema.safeParse({ query: 'abc' }).success).toBe(true);
    expect(aiAskSchema.safeParse({ query: 'x'.repeat(501) }).success).toBe(false);
    expect(aiAskSchema.safeParse({ query: 'x'.repeat(500) }).success).toBe(true);
  });
});

describe('AskResult contract shape', () => {
  it('grounded answers carry citations, model, method, cached; silence carries a reason', () => {
    const grounded: AskResult = {
      grounded: true,
      answer: 'a',
      citations: [{ slug: 'pranava-japa', section: 'summary', similarity: 1 }],
      model: 'm',
      method: 'embedding',
      cached: false,
    };
    const silent: AskResult = { grounded: false, reason: 'corpus_silent' };
    expect(grounded.grounded).toBe(true);
    expect(silent).toEqual({ grounded: false, reason: 'corpus_silent' });
  });
});
