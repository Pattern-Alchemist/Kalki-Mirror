// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';

// =============================================================
// VOL. 2 WEEK D — Tests for the Reach tier primitives:
//   · A/B experiment variant assignment + significance heuristic
//   · Hindi admin labels dictionary
//   · Admin prefs parsing + serialization
// =============================================================

import {
  parseVariants,
  serializeVariants,
  validateVariantWeights,
  assignVariant,
  experimentCookieName,
  computeExperimentStats,
  type ExperimentVariant,
} from '@/lib/admin/experiments';

// --- Variant parsing + serialization ---------------------------------------

describe('parseVariants + serializeVariants', () => {
  it('round-trips a variant array', () => {
    const vs: ExperimentVariant[] = [
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B', label: 'Variant', weight: 50 },
    ];
    const json = serializeVariants(vs);
    expect(parseVariants(json)).toEqual(vs);
  });
  it('returns [] for invalid JSON', () => {
    expect(parseVariants('not json')).toEqual([]);
  });
  it('returns [] for non-array JSON', () => {
    expect(parseVariants('{"a":1}')).toEqual([]);
  });
  it('filters out malformed variants', () => {
    const json = JSON.stringify([
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B' }, // missing label + weight
      { label: 'C', weight: 30 }, // missing id
      'not-an-object',
      null,
    ]);
    const parsed = parseVariants(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('A');
  });
  it('caps at 5 variants', () => {
    const vs = Array.from({ length: 8 }, (_, i) => ({
      id: String.fromCharCode(65 + i),
      label: `V${i}`,
      weight: 12,
    }));
    expect(parseVariants(serializeVariants(vs))).toHaveLength(5);
  });
});

// --- Variant weight validation ---------------------------------------------

describe('validateVariantWeights', () => {
  it('passes when weights sum to 100', () => {
    const r = validateVariantWeights([
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B', label: 'Variant', weight: 50 },
    ]);
    expect(r.ok).toBe(true);
  });
  it('fails when weights sum to 99', () => {
    const r = validateVariantWeights([
      { id: 'A', label: 'Control', weight: 49 },
      { id: 'B', label: 'Variant', weight: 50 },
    ]);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('100');
  });
  it('fails when fewer than 2 variants', () => {
    const r = validateVariantWeights([{ id: 'A', label: 'Control', weight: 100 }]);
    expect(r.ok).toBe(false);
  });
  it('fails when more than 5 variants', () => {
    const r = validateVariantWeights(
      Array.from({ length: 6 }, (_, i) => ({
        id: String.fromCharCode(65 + i),
        label: `V${i}`,
        weight: 16,
      })),
    );
    expect(r.ok).toBe(false);
  });
  it('fails on duplicate IDs', () => {
    const r = validateVariantWeights([
      { id: 'A', label: 'X', weight: 50 },
      { id: 'A', label: 'Y', weight: 50 },
    ]);
    expect(r.ok).toBe(false);
  });
});

// --- Variant assignment ----------------------------------------------------

describe('assignVariant', () => {
  const variants: ExperimentVariant[] = [
    { id: 'A', label: 'Control', weight: 50 },
    { id: 'B', label: 'Variant', weight: 50 },
  ];
  it('is deterministic (same seed = same variant)', () => {
    const v1 = assignVariant('user-123', variants);
    const v2 = assignVariant('user-123', variants);
    expect(v1?.id).toBe(v2?.id);
  });
  it('distributes across variants for different seeds', () => {
    const counts: Record<string, number> = { A: 0, B: 0 };
    for (let i = 0; i < 1000; i++) {
      const v = assignVariant(`seed-${i}`, variants);
      if (v) counts[v.id]++;
    }
    // Both variants should have received at least 1 (very high probability)
    expect(counts.A).toBeGreaterThan(0);
    expect(counts.B).toBeGreaterThan(0);
  });
  it('returns null for empty variants', () => {
    expect(assignVariant('seed', [])).toBeNull();
  });
  it('respects weight distribution (100/0)', () => {
    const weighted: ExperimentVariant[] = [
      { id: 'A', label: 'All', weight: 100 },
      { id: 'B', label: 'None', weight: 0 },
    ];
    for (let i = 0; i < 100; i++) {
      const v = assignVariant(`seed-${i}`, weighted);
      expect(v?.id).toBe('A');
    }
  });
});

// --- Cookie name ------------------------------------------------------------

describe('experimentCookieName', () => {
  it('returns the prefixed cookie name', () => {
    expect(experimentCookieName('abc123')).toBe('kalki-exp-abc123');
  });
});

// --- computeExperimentStats (significance heuristic) -----------------------

describe('computeExperimentStats', () => {
  it('returns zeros for empty data', () => {
    const stats = computeExperimentStats(
      [{ id: 'A', label: 'Control', weight: 50 }],
      {},
      {},
    );
    expect(stats.totalVisitors).toBe(0);
    expect(stats.totalConversions).toBe(0);
    expect(stats.isSignificant).toBe(false);
    expect(stats.lift).toBeNull();
  });
  it('computes conversion rates per variant', () => {
    const variants = [
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B', label: 'Variant', weight: 50 },
    ];
    const stats = computeExperimentStats(
      variants,
      { A: 100, B: 100 },
      { A: 5, B: 10 }, // B has 10% conv vs A's 5%
    );
    expect(stats.perVariant).toHaveLength(2);
    expect(stats.perVariant[0].conversionRate).toBeCloseTo(0.05);
    expect(stats.perVariant[1].conversionRate).toBeCloseTo(0.10);
    expect(stats.leadingVariant?.variantId).toBe('B');
    expect(stats.controlVariant?.variantId).toBe('A');
    expect(stats.lift).toBeCloseTo(100, 0); // 100% lift
    expect(stats.isSignificant).toBe(true); // n>=100 each, lift > 10%
  });
  it('is NOT significant when sample is too small', () => {
    const variants = [
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B', label: 'Variant', weight: 50 },
    ];
    const stats = computeExperimentStats(
      variants,
      { A: 50, B: 50 },
      { A: 2, B: 5 },
    );
    expect(stats.isSignificant).toBe(false); // n<100
  });
  it('is NOT significant when lift is < 10%', () => {
    const variants = [
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B', label: 'Variant', weight: 50 },
    ];
    const stats = computeExperimentStats(
      variants,
      { A: 200, B: 200 },
      { A: 100, B: 105 }, // 5% lift
    );
    expect(stats.isSignificant).toBe(false); // lift < 10%
  });
});

// --- Hindi labels ----------------------------------------------------------

import { HI_ADMIN_LABELS, hi } from '@/lib/admin/hi-labels';

describe('HI_ADMIN_LABELS dictionary', () => {
  it('translates core sidebar labels', () => {
    expect(HI_ADMIN_LABELS['Command']).toBe('आदेश');
    expect(HI_ADMIN_LABELS['People']).toBe('जन');
    expect(HI_ADMIN_LABELS['Craft']).toBe('शिल्प');
    expect(HI_ADMIN_LABELS['System']).toBe('तंत्र');
  });
  it('translates nav items', () => {
    expect(HI_ADMIN_LABELS['Overview']).toBe('अवलोकन');
    expect(HI_ADMIN_LABELS['Settings']).toBe('सेटिंग्स');
    expect(HI_ADMIN_LABELS['Golden Keys']).toBe('स्वर्ण कुंजी');
  });
  it('falls back to English for unknown labels', () => {
    expect(hi('Unknown Label')).toBe('Unknown Label');
  });
  it('translates known labels via hi()', () => {
    expect(hi('Overview')).toBe('अवलोकन');
    expect(hi('Refresh')).toBe('ताज़ा करें');
  });
});

// --- Admin prefs -----------------------------------------------------------

import { parsePrefs, serializePrefs, DEFAULT_PREFS, getLandingPageOptions } from '@/lib/admin/prefs';

describe('parsePrefs + serializePrefs', () => {
  it('returns defaults for null input', () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
  });
  it('returns defaults for invalid JSON', () => {
    expect(parsePrefs('not json')).toEqual(DEFAULT_PREFS);
  });
  it('round-trips a prefs object', () => {
    const prefs = { theme: 'light' as const, landingPage: '/admin/consultations', defaultRange: '7' as const, sidebarCollapsed: true, tablePageSize: 50 as const };
    const json = serializePrefs(prefs);
    expect(parsePrefs(json)).toEqual(prefs);
  });
  it('merges partial prefs with defaults', () => {
    const json = JSON.stringify({ theme: 'light' });
    const parsed = parsePrefs(json);
    expect(parsed.theme).toBe('light');
    expect(parsed.landingPage).toBe(DEFAULT_PREFS.landingPage);
    expect(parsed.tablePageSize).toBe(DEFAULT_PREFS.tablePageSize);
  });
});

describe('getLandingPageOptions', () => {
  it('returns the 7 landing page options', () => {
    const opts = getLandingPageOptions();
    expect(opts.length).toBe(7);
    expect(opts[0].value).toBe('/admin/overview');
  });
});
