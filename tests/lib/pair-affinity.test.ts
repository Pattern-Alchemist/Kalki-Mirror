import { describe, it, expect } from 'vitest';
import {
  buildPairAffinities,
  companionsOf,
  canonicalPair,
} from '@/lib/admin/pair-affinity';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #7 — pattern-pair affinity (derived, not vibes)
   ══════════════════════════════════════════════════════════════ */

describe('canonicalPair', () => {
  it('orders a pair alphabetically regardless of input order', () => {
    expect(canonicalPair('zeta', 'alpha')).toEqual(['alpha', 'zeta']);
    expect(canonicalPair('alpha', 'zeta')).toEqual(['alpha', 'zeta']);
  });
});

describe('buildPairAffinities', () => {
  it('counts co-occurrences and ranks strongest first', () => {
    const rows = buildPairAffinities([
      ['the-rescuer', 'the-controller'],
      ['the-rescuer', 'the-controller'],
      ['the-rescuer', 'the-controller', 'the-perfectionist'],
      ['the-perfectionist', 'the-controller'],
    ]);
    expect(rows[0]).toMatchObject({ slugA: 'the-controller', slugB: 'the-rescuer', pairCount: 3 });
    expect(rows.find((r) => r.slugA === 'the-controller' && r.slugB === 'the-perfectionist')?.pairCount).toBe(2);
  });

  it('collapses duplicates inside one submission (one seeker = one co-occurrence)', () => {
    const rows = buildPairAffinities([
      ['the-rescuer', 'the-rescuer', 'the-controller', 'the-controller'],
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].pairCount).toBe(1);
  });

  it('normalizes case/whitespace and drops empties', () => {
    const rows = buildPairAffinities([[' The-Rescuer ', '', 'the-controller', null as unknown as string]]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ slugA: 'the-controller', slugB: 'the-rescuer', pairCount: 1 });
  });

  it('is deterministic for equal counts (first-seen order kept)', () => {
    const lists = [['a', 'b'], ['c', 'd']];
    const one = buildPairAffinities(lists);
    const two = buildPairAffinities(lists);
    expect(one).toEqual(two);
  });

  it('returns empty for empty input', () => {
    expect(buildPairAffinities([])).toEqual([]);
    expect(buildPairAffinities([[], ['']])).toEqual([]);
  });
});

describe('companionsOf', () => {
  const rows = buildPairAffinities([
    ['the-rescuer', 'the-controller'],
    ['the-rescuer', 'the-controller'],
    ['the-rescuer', 'the-martyr'],
    ['the-controller', 'the-perfectionist'],
  ]);

  it('finds companions from either side of the canonical pair', () => {
    expect(companionsOf(rows, 'the-rescuer', 3)).toEqual([
      { slug: 'the-controller', pairCount: 2 },
      { slug: 'the-martyr', pairCount: 1 },
    ]);
    expect(companionsOf(rows, 'the-controller', 3)[0]).toEqual({ slug: 'the-rescuer', pairCount: 2 });
  });

  it('respects the limit and returns [] for unknown slugs', () => {
    expect(companionsOf(rows, 'the-rescuer', 1)).toHaveLength(1);
    expect(companionsOf(rows, 'not-a-pattern')).toEqual([]);
  });
});
