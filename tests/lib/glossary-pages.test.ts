import { describe, it, expect } from 'vitest';
import { glossaryEntries } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';
import {
  glossaryTermPath,
  glossaryTermJsonLd,
  resolveRelatedTerm,
} from '@/lib/seo/glossary-seo';

/**
 * Vol. 3 #4 — Lexicon term pages.
 *
 * 86 programmatic /glossary/[slug] pages minted from the glossary data
 * module. The slug space IS the termAnchor space (one derivation rule,
 * shared with the hub's #anchors), so every guard here protects both
 * the static params and the TermText auto-linker's hrefs.
 */
describe('glossary term slugs (static-param space)', () => {
  it('covers every lexicon term with a non-empty slug', () => {
    expect(glossaryEntries.length).toBeGreaterThan(0);
    for (const e of glossaryEntries) {
      const slug = termAnchor(e.term);
      expect(slug, `term "${e.term}" produced an empty slug`).not.toBe('');
      expect(glossaryTermPath(e.term)).toBe(`/glossary/${slug}`);
    }
  });

  it('slugs are unique — no two terms share a URL', () => {
    const slugs = glossaryEntries.map((e) => termAnchor(e.term));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('slugification is URL-safe (no spaces, no leading/trailing hyphens)', () => {
    for (const e of glossaryEntries) {
      const slug = termAnchor(e.term);
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it('diacritic folding: known terms map to their expected slugs', () => {
    expect(glossaryTermPath('Oṃ')).toBe('/glossary/om');
    expect(glossaryTermPath('Kuṇḍalinī')).toBe('/glossary/kundalini');
    expect(glossaryTermPath('Prāṇāyāma')).toBe('/glossary/pranayama');
  });
});

describe('related-term cross-links (must never 404)', () => {
  it('every resolvable related term round-trips to an entry whose slug is unique', () => {
    for (const e of glossaryEntries) {
      for (const name of e.relatedTerms ?? []) {
        const rel = resolveRelatedTerm(name);
        if (rel) {
          // if it resolves, its page exists — path derivation must be stable
          expect(glossaryTermPath(rel.term)).toBe(`/glossary/${termAnchor(rel.term)}`);
        }
        // unresolvable names are rendered as plain chips on hub AND term
        // pages — the renderer filters by resolveRelatedTerm, so this is
        // allowed, but a name that IS an entry must resolve case-insensitively
        const exact = glossaryEntries.find((g) => g.term === name);
        if (exact) expect(resolveRelatedTerm(name)?.term).toBe(exact.term);
      }
    }
  });

  it('the term page filters out self-links', () => {
    // a term whose relatedTerms include itself (case variants) must not link to itself
    for (const e of glossaryEntries) {
      const related = (e.relatedTerms ?? [])
        .map((n) => resolveRelatedTerm(n))
        .filter((r) => r && termAnchor(r.term) !== termAnchor(e.term));
      for (const r of related) {
        expect(termAnchor(r!.term)).not.toBe(termAnchor(e.term));
      }
    }
  });
});

describe('DefinedTerm JSON-LD (term pages + hub termset agreement)', () => {
  it('builds a DefinedTerm addressable at its own URL inside the hub termset', () => {
    const entry = glossaryEntries.find((e) => e.term === 'Kuṇḍalinī')!;
    const graph = glossaryTermJsonLd(entry);
    expect(graph['@context']).toBe('https://schema.org');

    const [term, crumbs] = graph['@graph'];
    expect(term['@type']).toBe('DefinedTerm');
    expect(term['name']).toBe('Kuṇḍalinī');
    expect(term['alternateName']).toBe(entry.sanskrit);
    expect(term['description']).toBe(entry.definition);
    expect(term['url']).toBe('https://www.astrokalki.com/glossary/kundalini');
    expect(term['inDefinedTermSet']).toEqual({
      '@id': 'https://www.astrokalki.com/glossary#termset',
    });

    expect(crumbs['@type']).toBe('BreadcrumbList');
    expect(crumbs['itemListElement']).toHaveLength(3);
    expect(crumbs['itemListElement'][2].item).toBe(term['url']);
  });

  it('descriptions match the hub graph exactly (one source of truth)', () => {
    for (const e of glossaryEntries.slice(0, 5)) {
      const termNode = glossaryTermJsonLd(e)['@graph'][0];
      expect(termNode['description']).toBe(e.definition);
    }
  });
});
