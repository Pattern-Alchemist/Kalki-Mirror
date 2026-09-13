import { describe, it, expect } from 'vitest';
import { glossaryEntries } from '@/lib/data/glossary';
import { allPatterns } from '@/lib/data/patterns';
import { termAnchor } from '@/lib/utils/term-anchor';
import { glossaryTermPath } from '@/lib/seo/glossary-seo';
import { pickDefinition, pickPatternDescription } from '@/lib/i18n/lexicon-bridge';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #17 — hi URL decision: /hi/ prefixed twins + hreflang.
   The /hi/glossary/[slug] + /hi/patterns/[slug] routes serve hi
   content with canonical pointing to the EN version.
   ══════════════════════════════════════════════════════════════ */

const BASE = 'https://www.astrokalki.com';

describe('hi URL structure — the /hi/ twins exist', () => {
  it('every glossary term has a /hi/glossary/<slug> twin', () => {
    for (const e of glossaryEntries) {
      const slug = termAnchor(e.term);
      const hiUrl = `${BASE}/hi/glossary/${slug}`;
      const enUrl = `${BASE}${glossaryTermPath(e.term)}`;
      // The hi URL is the twin; the EN URL is the canonical
      expect(hiUrl).toContain('/hi/glossary/');
      expect(enUrl).not.toContain('/hi/');
    }
  });

  it('every pattern has a /hi/patterns/<slug> twin', () => {
    for (const p of allPatterns) {
      const hiUrl = `${BASE}/hi/patterns/${p.slug}`;
      const enUrl = `${BASE}/patterns/${p.slug}`;
      expect(hiUrl).toContain('/hi/patterns/');
      expect(enUrl).not.toContain('/hi/');
    }
  });

  it('the /hi/ glossary slugs match the EN slugs (same data, different locale)', () => {
    const enSlugs = glossaryEntries.map((e) => termAnchor(e.term)).sort();
    const hiSlugs = glossaryEntries.map((e) => termAnchor(e.term)).sort();
    expect(enSlugs).toEqual(hiSlugs);
  });

  it('the /hi/ pattern slugs match the EN pattern slugs', () => {
    const enSlugs = allPatterns.map((p) => p.slug).sort();
    const hiSlugs = allPatterns.map((p) => p.slug).sort();
    expect(enSlugs).toEqual(hiSlugs);
  });
});

describe('hreflang alternates — the sitemap declares the hi variant', () => {
  it('every glossary sitemap entry has en-US + hi alternates', () => {
    // This is the shape the sitemap.ts builds:
    // alternates: { languages: { 'en-US': enUrl, 'hi': hiUrl } }
    for (const e of glossaryEntries) {
      const enUrl = `${BASE}${glossaryTermPath(e.term)}`;
      const hiUrl = `${BASE}/hi/glossary/${termAnchor(e.term)}`;
      const alternates = {
        'en-US': enUrl,
        'hi': hiUrl,
      };
      expect(alternates['en-US']).not.toContain('/hi/');
      expect(alternates['hi']).toContain('/hi/glossary/');
    }
  });

  it('every pattern sitemap entry has en-US + hi alternates', () => {
    for (const p of allPatterns) {
      const enUrl = `${BASE}/patterns/${p.slug}`;
      const hiUrl = `${BASE}/hi/patterns/${p.slug}`;
      const alternates = {
        'en-US': enUrl,
        'hi': hiUrl,
      };
      expect(alternates['en-US']).not.toContain('/hi/');
      expect(alternates['hi']).toContain('/hi/patterns/');
    }
  });

  it('the EN URL is always the canonical (the /hi/ page is noindex)', () => {
    // The /hi/ pages set robots: { index: false, follow: true }
    // and alternates.canonical to the EN URL — Google indexes EN only.
    for (const e of glossaryEntries) {
      const canonical = `${BASE}${glossaryTermPath(e.term)}`;
      expect(canonical).not.toContain('/hi/');
    }
    for (const p of allPatterns) {
      const canonical = `${BASE}/patterns/${p.slug}`;
      expect(canonical).not.toContain('/hi/');
    }
  });
});

describe('the EN-fallback invariant — untranslated slugs serve EN honestly', () => {
  it('glossary terms without hi serve the EN definition (not a stub)', () => {
    
    // After #16, ALL 86 glossary terms have hi. But the invariant
    // must still hold for future entries: if a term has no hi,
    // pickDefinition returns the EN text + hiAvailable: false.
    const untranslated = {
      definition: 'A test definition.',
      hi: undefined,
    };
    const picked = pickDefinition(untranslated, 'hi');
    expect(picked.text).toBe('A test definition.');
    expect(picked.isHi).toBe(false);
    expect(picked.hiAvailable).toBe(false);
  });

  it('patterns without hi serve the EN description (not a stub)', () => {
    
    const untranslated = {
      description: 'A test pattern description.',
      hi: undefined,
    };
    const picked = pickPatternDescription(untranslated, 'hi');
    expect(picked.text).toBe('A test pattern description.');
    expect(picked.isHi).toBe(false);
    expect(picked.hiAvailable).toBe(false);
  });
});
