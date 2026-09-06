/**
 * Vol. 1 #19 — wizard a11y pass: WCAG contrast audit.
 *
 * These are the REAL token values from src/app/globals.css audited against
 * the REAL effective backgrounds of the wizard surface (dark body + the
 * glass-panel composite rgba(11,12,16,0.45) over #0A0A0A). Every pair below
 * currently passes AA (≥ 4.5:1) for normal text; the test locks them so a
 * future token tweak that degrades accessibility fails CI with a named pair.
 */

import { describe, it, expect } from 'vitest';
import { contrastRatio, compositeOver, relativeLuminance } from '@/lib/a11y/contrast';

// ── Design tokens (mirrored from src/app/globals.css :root) ──────────────
const TOKENS = {
  background: '#0A0A0A',
  foreground: '#F5F5F0',
  textSecondary: '#D5D2C9',
  textMuted: '#9A998F',
  gold: '#D4AF37',
  goldBright: '#E8C855',
  goldDim: '#9A7B3A',
  glassPanel: '#0B0C10', // rgba(11,12,16,0.45)
  glassAlpha: 0.45,
  error400: '#F87171', // tailwind red-400 — wizard form errors
  ctaText: '#14100A', // gold-cta text on gold gradient
} as const;

// Effective background behind the glass panel (composited, not raw).
const glassComposite = compositeOver(TOKENS.glassPanel, TOKENS.glassAlpha, TOKENS.background);

/** AA minimum for normal text. */
const AA = 4.5;

describe('contrast math sanity', () => {
  it('black vs white is the maximal 21:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('identical colors are 1:1', () => {
    expect(contrastRatio('#0A0A0A', '#0A0A0A')).toBeCloseTo(1, 5);
  });

  it('relativeLuminance rejects malformed hex', () => {
    expect(() => relativeLuminance('#12345')).toThrow(/Invalid hex/);
    expect(() => relativeLuminance('zzz')).toThrow(/Invalid hex/);
  });

  it('compositeOver composes channel-wise (50% grey over white = ~#808080)', () => {
    expect(compositeOver('#000000', 0.5, '#FFFFFF')).toBe('#808080');
  });
});

describe('wizard text tokens pass WCAG AA on the dark body', () => {
  const cases: Array<[string, string, string]> = [
    ['foreground on background', TOKENS.foreground, TOKENS.background],
    ['text-secondary on background', TOKENS.textSecondary, TOKENS.background],
    ['text-muted on background', TOKENS.textMuted, TOKENS.background],
    ['gold on background', TOKENS.gold, TOKENS.background],
    ['gold-bright on background', TOKENS.goldBright, TOKENS.background],
  ];
  for (const [name, fg, bg] of cases) {
    it(`${name} ≥ ${AA}:1`, () => {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(AA);
    });
  }
});

describe('wizard text tokens pass WCAG AA on the glass panel composite', () => {
  const cases: Array<[string, string]> = [
    ['foreground on glass', TOKENS.foreground],
    ['text-secondary on glass', TOKENS.textSecondary],
    ['text-muted on glass (slider low/high labels)', TOKENS.textMuted],
    ['gold on glass (slider value)', TOKENS.gold],
    ['gold-bright on glass', TOKENS.goldBright],
    ['red-400 on glass (form errors)', TOKENS.error400],
  ];
  for (const [name, fg] of cases) {
    it(`${name} ≥ ${AA}:1 (composite ${glassComposite})`, () => {
      expect(contrastRatio(fg, glassComposite)).toBeGreaterThanOrEqual(AA);
    });
  }
});

describe('gold CTA self-contrast (dark text on gold gradient)', () => {
  it('ctaText on the gold gradient midpoint ≥ AA', () => {
    // gold-cta gradient spans #f0d878 → gold-bright → gold → #b08a3e;
    // the darkest stop (#b08a3e) is the worst case for dark text.
    expect(contrastRatio(TOKENS.ctaText, '#b08a3e')).toBeGreaterThanOrEqual(AA);
  });

  it('ctaText on the brightest gradient stop ≥ AA', () => {
    expect(contrastRatio(TOKENS.ctaText, '#f0d878')).toBeGreaterThanOrEqual(AA);
  });
});

describe('known decorative-only pairs are recorded honestly', () => {
  it('gold-dim passes AA on glass but is decorative-grade — pinned ≥ 4.5', () => {
    // Used for separators/underlines only, never body copy — still AA here.
    expect(contrastRatio(TOKENS.goldDim, glassComposite)).toBeGreaterThanOrEqual(AA);
  });
});
