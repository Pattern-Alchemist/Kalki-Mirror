/**
 * Vol. 1 #16 — behavioral bridge for RAG.
 *
 * The bridge is a CONTRACT, not a convenience: every pattern→folio mapping
 * must point at a real FolioChunk slug in the baked corpus, and the boost
 * math must be deterministic. A mapping that drifts from the corpus would
 * silently stop grounding (boosting nothing), and a non-deterministic boost
 * would make retrieval untestable.
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@libsql/client';
import { join } from 'path';
import {
  PATTERN_FOLIO_BRIDGE,
  bridgeSlugsFor,
  bridgeSlugsForNames,
} from '@/lib/rag/pattern-bridge';
import { allPatterns } from '@/lib/data/patterns';
import { applyPatternBoost, PATTERN_BOOST } from '@/lib/rag/retrieval';

describe('PATTERN_FOLIO_BRIDGE (mapping shape)', () => {
  it('covers every canonical pattern slug', () => {
    const bridgeSlugs = Object.keys(PATTERN_FOLIO_BRIDGE);
    const patternSlugs = allPatterns.map((p) => p.slug);
    expect(new Set(bridgeSlugs)).toEqual(new Set(patternSlugs));
  });

  it('derives each mapping from the pattern corpus relatedSiddhis verbatim', () => {
    for (const p of allPatterns) {
      expect(PATTERN_FOLIO_BRIDGE[p.slug]).toEqual(p.relatedSiddhis);
    }
  });

  it('maps patterns that declare relatedSiddhis to at least one folio', () => {
    const withSiddhis = allPatterns.filter((p) => p.relatedSiddhis.length > 0);
    expect(withSiddhis.length).toBeGreaterThan(0);
    for (const p of withSiddhis) {
      expect(PATTERN_FOLIO_BRIDGE[p.slug].length).toBeGreaterThan(0);
    }
  });
});

describe('bridgeSlugsFor', () => {
  it('returns the union of linked folios for multiple patterns', () => {
    // the-rescuer → [nadi-shuddhi, soham-dhyana]; the-ghost → [soham-dhyana, yoga-nidra]
    const out = bridgeSlugsFor(['the-rescuer', 'the-ghost']);
    expect(out).toContain('nadi-shuddhi');
    expect(out).toContain('soham-dhyana');
    expect(out).toContain('yoga-nidra');
  });

  it('dedupes folios shared across patterns', () => {
    const out = bridgeSlugsFor(['the-rescuer', 'the-ghost']);
    expect(out.filter((s) => s === 'soham-dhyana')).toHaveLength(1);
  });

  it('ignores unknown pattern slugs (fail-soft)', () => {
    expect(bridgeSlugsFor(['not-a-pattern', 'the-rescuer'])).toEqual(
      PATTERN_FOLIO_BRIDGE['the-rescuer'],
    );
    expect(bridgeSlugsFor(['not-a-pattern'])).toEqual([]);
  });

  it('handles empty input', () => {
    expect(bridgeSlugsFor([])).toEqual([]);
  });
});

describe('bridgeSlugsForNames', () => {
  it('resolves canonical pattern names to the same union as slugs', () => {
    const bySlug = bridgeSlugsFor(['the-rescuer', 'the-ghost']);
    const byName = bridgeSlugsForNames(['The Rescuer', 'The Ghost']);
    expect(byName).toEqual(bySlug);
  });

  it('ignores unknown names', () => {
    expect(bridgeSlugsForNames(['No Such Pattern'])).toEqual([]);
  });
});

describe('applyPatternBoost (deterministic boost math)', () => {
  const scored = [
    { slug: 'unmapped-a', similarity: 0.9 },
    { slug: 'mapped-folio', similarity: 0.5 },
    { slug: 'unmapped-b', similarity: 0.6 },
  ];

  it('boosts mapped chunks by exactly PATTERN_BOOST', () => {
    const out = applyPatternBoost(scored, ['mapped-folio']);
    expect(out.find((c) => c.slug === 'mapped-folio')!.similarity).toBeCloseTo(
      0.5 + PATTERN_BOOST,
    );
  });

  it('leaves unmapped chunks untouched', () => {
    const out = applyPatternBoost(scored, ['mapped-folio']);
    expect(out.find((c) => c.slug === 'unmapped-a')!.similarity).toBe(0.9);
    expect(out.find((c) => c.slug === 'unmapped-b')!.similarity).toBe(0.6);
  });

  it('does not mutate the input array or its objects', () => {
    const snapshot = JSON.parse(JSON.stringify(scored));
    applyPatternBoost(scored, ['mapped-folio']);
    expect(scored).toEqual(snapshot);
  });

  it('caps similarity at 1', () => {
    const out = applyPatternBoost(
      [{ slug: 'mapped-folio', similarity: 0.99 }],
      ['mapped-folio'],
    );
    expect(out[0].similarity).toBe(1);
  });

  it('returns the input unchanged for an empty boost list', () => {
    expect(applyPatternBoost(scored, [])).toBe(scored);
  });

  it('lets a mapped chunk overtake higher-scoring unmapped chunks', () => {
    const out = applyPatternBoost(scored, ['mapped-folio']);
    const sorted = [...out].sort((a, b) => b.similarity - a.similarity);
    expect(sorted[0].slug).toBe('unmapped-a'); // 0.9 still wins...
    expect(sorted.indexOf(sorted.find((c) => c.slug === 'mapped-folio')!)).toBeLessThan(
      sorted.indexOf(sorted.find((c) => c.slug === 'unmapped-b')!),
    ); // ...but mapped-folio (0.75) now passes unmapped-b (0.6)
  });
});

describe('corpus sync (bridge ↔ baked FolioChunk corpus)', () => {
  it('every mapped folio slug exists as a FolioChunk slug in db/custom.db', async () => {
    const client = createClient({ url: `file:${join(process.cwd(), 'db', 'custom.db')}` });
    try {
      const res = await client.execute('SELECT DISTINCT slug FROM FolioChunk');
      const corpusSlugs = new Set(res.rows.map((r) => String(r.slug)));
      expect(corpusSlugs.size).toBeGreaterThan(0);

      const missing: string[] = [];
      for (const [pattern, folios] of Object.entries(PATTERN_FOLIO_BRIDGE)) {
        for (const folio of folios) {
          if (!corpusSlugs.has(folio)) missing.push(`${pattern} → ${folio}`);
        }
      }
      expect(missing, `bridge slugs missing from corpus: ${missing.join(', ')}`).toEqual([]);
    } finally {
      client.close();
    }
  });
});
