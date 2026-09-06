import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { allPatterns } from '@/lib/data/patterns';
import {
  PRIMER_PATTERN_SLUGS,
  PRIMER_PDF_PATH,
  primerPatterns,
} from '@/lib/data/primer';

/**
 * The Seven Patterns primer (lead magnet).
 *
 * The PDF is a baked asset; this module is the code-side registry of
 * what it contains. These guards hold the seam between the two: the
 * primer's pattern selection must always resolve against the live
 * Pattern Atlas, and the baked PDF must always exist at the path the
 * gate reveals. If either side moves, CI moves with it.
 */
describe('primer pattern selection', () => {
  it('features exactly seven patterns', () => {
    expect(PRIMER_PATTERN_SLUGS).toHaveLength(7);
  });

  it('every primer slug resolves to a live pattern in the Atlas', () => {
    for (const slug of PRIMER_PATTERN_SLUGS) {
      const p = allPatterns.find((pat) => pat.slug === slug);
      expect(p, `primer slug "${slug}" missing from allPatterns`).toBeDefined();
      expect(p?.name).toBeTruthy();
      expect(p?.description).toBeTruthy();
      expect(p?.signs.length).toBeGreaterThan(0);
      expect(p?.practice).toBeTruthy();
    }
  });

  it('primer slugs are unique', () => {
    expect(new Set(PRIMER_PATTERN_SLUGS).size).toBe(PRIMER_PATTERN_SLUGS.length);
  });

  it('primerPatterns() returns the records in primer order', () => {
    const records = primerPatterns();
    expect(records.map((p) => p.slug)).toEqual([...PRIMER_PATTERN_SLUGS]);
  });

  it('covers all four zones of the corpus (two per early zone, arc through Integration)', () => {
    // Zone composition of the selection: I, I, II, III, IV, IV, IV —
    // pinned so a casual edit cannot silently collapse the primer to one zone.
    expect(PRIMER_PATTERN_SLUGS).toEqual([
      'the-rescuer',
      'the-perfectionist',
      'the-saboteur',
      'the-martyr',
      'the-judge',
      'the-seeker',
      'the-void',
    ]);
  });
});

describe('primer baked asset', () => {
  it('the PDF exists at the committed path the gate reveals', () => {
    // vitest runs from the repo root; the asset is committed beside the code.
    expect(existsSync(join(process.cwd(), 'public', PRIMER_PDF_PATH))).toBe(true);
  });

  it('the path is namespaced and immutable-friendly', () => {
    expect(PRIMER_PDF_PATH).toMatch(/^\/downloads\/[a-z0-9-]+\.pdf$/);
  });
});
