import { describe, expect, it } from 'vitest';
import en from '@/i18n/messages/en.json';
import hi from '@/i18n/messages/hi.json';
import {
  buildWizardCopy,
  modalityKey,
  MODALITY_VALUES,
  type WizardT,
} from '@/components/consultations/wizard-copy';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #19 — hi-locale wizard. A missing key in hi.json would
   crash the seeker's wizard mid-flow; structural parity is the
   regression net. Data values (experience/modalities) stay
   canonical English — only labels translate.
   ══════════════════════════════════════════════════════════════ */

function keyPaths(obj: unknown, prefix = ''): string[] {
  if (typeof obj === 'string') return [prefix];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => keyPaths(v, `${prefix}.${i}`));
  if (obj && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k)
    );
  }
  return [prefix];
}

describe('wizard message parity (en ↔ hi)', () => {
  const enPaths = keyPaths(en.wizard);
  const hiPaths = keyPaths(hi.wizard);

  it('hi.json carries every en.json wizard key', () => {
    const missing = enPaths.filter((p) => !hiPaths.includes(p));
    expect(missing, `missing in hi.json: ${missing.join(', ')}`).toEqual([]);
  });

  it('hi.json carries no orphan wizard keys', () => {
    const orphan = hiPaths.filter((p) => !enPaths.includes(p));
    expect(orphan, `orphan in hi.json: ${orphan.join(', ')}`).toEqual([]);
  });

  it('step arrays are aligned (5 steps, 4 sliders)', () => {
    expect(en.wizard.steps).toHaveLength(5);
    expect(hi.wizard.steps).toHaveLength(5);
    expect(Object.keys(en.wizard.step2.sliders)).toEqual(Object.keys(hi.wizard.step2.sliders));
  });

  it('Hindi translations are actually Devanagari (not English copies)', () => {
    const hiSteps = hi.wizard.steps as string[];
    for (const s of hiSteps) {
      expect(/[\u0900-\u097F]/.test(s), `step "${s}" has no Devanagari`).toBe(true);
    }
  });

  it('ICU placeholders survive translation ({n}, {amount})', () => {
    expect(hi.wizard.step1.countSelected).toContain('{n}');
    expect(hi.wizard.success.payCta).toContain('{amount}');
  });

  it('rich-text <gold> tags survive translation', () => {
    expect(en.wizard.step1.intro).toContain('<gold>');
    expect(hi.wizard.step1.intro).toContain('<gold>');
    expect(hi.wizard.step4.intro).toContain('<gold>');
  });
});

describe('buildWizardCopy', () => {
  const fakeT: WizardT = (key, values) => {
    let out = `k:${key}`;
    if (values) for (const [k, v] of Object.entries(values)) out += `|${k}=${v}`;
    return out;
  };

  it('builds all 5 steps and 4 slider questions', () => {
    const copy = buildWizardCopy(fakeT);
    expect(copy.steps).toHaveLength(5);
    expect(copy.step2.sliders).toHaveLength(4);
    expect(copy.step2.sliders.map((s) => s.key)).toEqual([
      'emotionalStability',
      'patternAwareness',
      'discomfortWillingness',
      'previousGuidance',
    ]);
  });

  it('translates every canonical modality value', () => {
    const copy = buildWizardCopy(fakeT);
    for (const m of MODALITY_VALUES) {
      expect(copy.step4.modalityLabels[m]).toBe(`k:modalities.${modalityKey(m)}`);
    }
  });

  it('countSelected interpolates the count', () => {
    const copy = buildWizardCopy(fakeT);
    expect(copy.step1.countSelected(2)).toContain('|n=2');
  });

  it('payCta interpolates the formatted amount', () => {
    const copy = buildWizardCopy(fakeT);
    expect(copy.success.payCta('₹1,999')).toContain('|amount=₹1,999');
  });
});

describe('modalityKey coverage', () => {
  it('maps all six canonical values to distinct keys', () => {
    const keys = MODALITY_VALUES.map(modalityKey);
    expect(new Set(keys).size).toBe(6);
  });
});

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #14 — FULL-SHELL parity. The wizard test above only
   covered the wizard namespace; the public shell (hero, footer,
   tiers, archive, patterns, practice, consultations, ai, auth,
   errors, health, caution) stayed English-only. From now on the
   WHOLE keyset must match both ways — a new English key cannot
   ship without its Hindi translation.
   ══════════════════════════════════════════════════════════════ */

describe('full-shell message parity (en ↔ hi)', () => {
  const allEn = keyPaths(en);
  const allHi = keyPaths(hi);

  it('hi.json carries every en.json key across ALL namespaces', () => {
    const missing = allEn.filter((p) => !allHi.includes(p));
    expect(missing, `missing in hi.json: ${missing.join(', ')}`).toEqual([]);
  });

  it('hi.json carries no orphan keys across ALL namespaces', () => {
    const orphan = allHi.filter((p) => !allEn.includes(p));
    expect(orphan, `orphan in hi.json: ${orphan.join(', ')}`).toEqual([]);
  });

  it('ICU placeholders survive translation on every key', () => {
    const PLACEHOLDER = /\{[a-zA-Z]+\}/g;
    const enPlaceholders = new Map<string, Set<string>>();
    for (const p of allEn) {
      const v = p
        .split('.')
        .reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], en);
      if (typeof v === 'string') {
        const m = v.match(PLACEHOLDER);
        if (m) enPlaceholders.set(p, new Set(m));
      }
    }
    expect(enPlaceholders.size).toBeGreaterThan(0);
    for (const [p, expected] of enPlaceholders) {
      const v = p
        .split('.')
        .reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], hi);
      const actual = new Set((typeof v === 'string' ? v.match(PLACEHOLDER) : null) ?? []);
      expect(
        actual.size === expected.size && [...expected].every((x) => actual.has(x)),
        `placeholder drift at hi.json ${p}`
      ).toBe(true);
    }
  });

  it('no control characters in any locale value (NUL-corruption guard)', () => {
    // Regression: hi.json wizard.step1.intro once carried literal
    // "\u0000935" garbage from a broken \u0935 escape. Control chars
    // in a translation are ALWAYS corruption — ban them everywhere.
    const CONTROL = /[\u0000-\u001F\u007F]/;
    for (const [locale, tree] of [['en', en], ['hi', hi]] as const) {
      for (const p of keyPaths(tree)) {
        const v = p
          .split('.')
          .reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], tree);
        expect(
          typeof v === 'string' ? CONTROL.test(v) : false,
          `control character in ${locale}.json ${p}`
        ).toBe(false);
      }
    }
  });

  it('translated shell namespaces are actually Devanagari', () => {
    const samples: Array<[string, string]> = [
      ['hero.tagline', pick(hi, 'hero.tagline')],
      ['footer.tagline', pick(hi, 'footer.tagline')],
      ['tiers.agniDesc', pick(hi, 'tiers.agniDesc')],
      ['archive.acknowledge', pick(hi, 'archive.acknowledge')],
      ['caution.SEALED', pick(hi, 'caution.SEALED')],
      ['errors.unauthorized', pick(hi, 'errors.unauthorized')],
      ['ai.noLLM', pick(hi, 'ai.noLLM')],
    ];
    for (const [p, v] of samples) {
      expect(typeof v === 'string' && /[\u0900-\u097F]/.test(v), `${p} is not Devanagari`).toBe(true);
    }
  });

  it('the fixed wizard intro reads clean Devanagari (no digit fragments)', () => {
    const intro = hi.wizard.step1.intro;
    expect(intro).toContain('व्यक्त');
    expect(intro).toContain('दिखाता');
    expect(intro).not.toMatch(/\d{3}/);
  });
});

function pick(tree: Record<string, unknown>, path: string): string {
  const v = path
    .split('.')
    .reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], tree);
  return typeof v === 'string' ? v : '';
}
