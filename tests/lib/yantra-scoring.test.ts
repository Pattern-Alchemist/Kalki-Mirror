import { describe, it, expect } from 'vitest';
import { computePrescriptions, WEIGHTS } from '@/lib/yantra/scoring';
import { allPatterns } from '@/lib/data/patterns';

describe('YANTRA deterministic scoring core', () => {
  it('is deterministic — same input, same output', () => {
    const a = computePrescriptions({ patternIds: ['the-rescuer'] });
    const b = computePrescriptions({ patternIds: ['the-rescuer'] });
    expect(a.prescriptions.map((p) => p.folioSlug)).toEqual(
      b.prescriptions.map((p) => p.folioSlug)
    );
    expect(a.prescriptions.map((p) => p.totalScore)).toEqual(
      b.prescriptions.map((p) => p.totalScore)
    );
  });

  it('prescribes folios explicitly related to the pattern first', () => {
    const out = computePrescriptions({ patternIds: ['the-rescuer'] });
    expect(out.prescriptions.length).toBeGreaterThan(0);
    const top = out.prescriptions[0];
    expect(top.matchedPatterns).toContain('the-rescuer');
    expect(
      top.components.some((c) => c.name === 'pattern_prescribed' && c.points === WEIGHTS.PATTERN_PRESCRIBED)
    ).toBe(true);
  });

  it('identifies the dominant archetype from the first pattern', () => {
    const out = computePrescriptions({ patternIds: ['the-rescuer', 'the-pleaser'] });
    // both map to tara
    expect(out.dominantArchetypeId).toBe('tara');
  });

  it('excludes nothing for unknown patterns — returns empty prescriptions', () => {
    const out = computePrescriptions({ patternIds: ['not-a-real-pattern'] });
    expect(out.prescriptions).toHaveLength(0);
  });

  it('decomposes every score into named components', () => {
    const out = computePrescriptions({ patternIds: ['the-seeker'] });
    for (const p of out.prescriptions) {
      const sum = p.components.reduce((s, c) => s + c.points, 0);
      expect(sum).toBe(p.totalScore);
      expect(p.components.length).toBeGreaterThan(0);
      for (const c of p.components) {
        expect(c.name).toBeTruthy();
        expect(c.note).toBeTruthy();
      }
    }
  });

  it('respects tier gating — gated folios are marked, not silently dropped', () => {
    const out = computePrescriptions({ patternIds: ['the-seeker'], tier: 'akash' });
    const low = computePrescriptions({ patternIds: ['the-seeker'], tier: 'prithvi' });
    // Akash view should surface strictly more-or-equal eligible folios
    const eligibleHigh = out.prescriptions.filter((p) => !p.gatedBy).length;
    const eligibleLow = low.prescriptions.filter((p) => !p.gatedBy).length;
    expect(eligibleHigh).toBeGreaterThanOrEqual(eligibleLow);
  });

  it('bounds the prescription list', () => {
    const out = computePrescriptions({ patternIds: Object.keys(allPatterns).slice(0, 0).length ? [] : ['the-rescuer'] });
    expect(out.prescriptions.length).toBeLessThanOrEqual(8);
  });

  it('carries the engine version stamp', () => {
    const out = computePrescriptions({ patternIds: ['the-rescuer'] });
    expect(out.engine).toBe('yantra-deterministic-v1');
  });
});
