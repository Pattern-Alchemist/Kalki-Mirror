import { describe, it, expect } from 'vitest';
import { linkTermSegments, countTermLinks } from '@/lib/seo/glossary-autolink';
import { glossaryEntries } from '@/lib/data/glossary';

/**
 * Vol. 4 #9 — the Lexicon auto-linker. TermText (Vol. 3 #4) already
 * linked folio and pattern prose; the glossary term pages were the
 * missing node: 86 definitions mentioning other terms as plain text —
 * a crawl star, not a web. This suite pins the pure matcher both
 * engines now share.
 */

describe('linkTermSegments: matching rules (carried from the TermText matcher)', () => {
  it('links the first occurrence of a term and leaves repeats plain', () => {
    const segs = linkTermSegments('Prāṇa rides the breath. Prāṇa again.');
    const links = segs.filter((s) => s.term === 'Prāṇa');
    expect(links).toHaveLength(1);
    expect(links[0].text).toBe('Prāṇa');
  });

  it('longest term wins: Prāṇāyāma never links as Prāṇa', () => {
    const segs = linkTermSegments('The practice of Prāṇāyāma refines Prāṇa.');
    const linked = segs.filter((s) => s.term).map((s) => s.term);
    expect(linked).toContain('Prāṇāyāma');
    expect(linked).toContain('Prāṇa');
    // The Prāṇāyāma occurrence must NOT have been consumed as Prāṇa:
    expect(segs.filter((s) => s.term === 'Prāṇa')).toHaveLength(1);
  });

  it('Unicode word boundaries: Karma never matches inside Karmamudrā', () => {
    const segs = linkTermSegments('Karmamudrā is a gesture, not bare Karma.');
    const linked = segs.filter((s) => s.term).map((s) => s.term);
    expect(linked).toEqual(['Karma']); // only the standalone word
  });

  it('Oṃ never matches inside Oṃkāra', () => {
    const segs = linkTermSegments('Oṃkāra contains Oṃ.');
    expect(segs.filter((s) => s.term === 'Oṃ')).toHaveLength(1);
  });

  it('is case-insensitive on diacritic-exact text', () => {
    const segs = linkTermSegments('the kuṇḍalinī current rises');
    expect(segs.some((s) => s.term === 'Kuṇḍalinī')).toBe(true);
  });

  it('plain text passes through unchanged when no terms appear', () => {
    expect(linkTermSegments('no lexicon words here')).toEqual([
      { text: 'no lexicon words here' },
    ]);
  });
});

describe('linkTermSegments: self-exclusion (a term page never links itself)', () => {
  it('excludes its own term but links sibling terms', () => {
    const segs = linkTermSegments('Nāḍī channels carry Prāṇa through the nāḍī system.', {
      exclude: 'Nāḍī',
    });
    expect(segs.some((s) => s.term === 'Nāḍī')).toBe(false);
    expect(segs.some((s) => s.term === 'Prāṇa')).toBe(true);
  });

  it('exclude matches by anchor, so any case/diacritic form of the term is suppressed', () => {
    const segs = linkTermSegments('kuṇḍalinī', { exclude: 'Kuṇḍalinī' });
    expect(segs.some((s) => s.term)).toBe(false);
  });
});

describe('the crawl web (Vol. 4 #9 outcome)', () => {
  it('every glossary definition corpus produces a real web, not a star', () => {
    let total = 0;
    let linkedBodies = 0;
    for (const entry of glossaryEntries) {
      const n = countTermLinks(entry.definition, { exclude: entry.term });
      total += n;
      if (n > 0) linkedBodies += 1;
    }
    // Floor pin: the graph must not collapse. (Measured at ship time:
    // comfortably above 100 cross-links across 86 bodies; the floor is
    // set well below to catch only a true regression.)
    expect(total).toBeGreaterThan(100);
    expect(linkedBodies).toBeGreaterThan(40);
  });

  it('no definition ever links itself, whatever the matcher sees', () => {
    for (const entry of glossaryEntries) {
      const selfAnchor = countTermLinks(entry.definition, { exclude: entry.term });
      expect(selfAnchor, entry.term).toBeGreaterThanOrEqual(0); // exhaustiveness smoke
      const segs = linkTermSegments(entry.definition, { exclude: entry.term });
      expect(segs.some((s) => s.term === entry.term)).toBe(false);
    }
  });
});
