import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { TermText } from '@/components/longform/TermText';

describe('TermText — Lexicon auto-linker', () => {
  it('links glossary terms to their programmatic pages (Vol. 3 #4)', () => {
    const html = renderToString(
      <TermText text="The Kuṇḍalinī rises through prāṇāyāma and mantra practice." />
    );
    expect(html).toContain('href="/glossary/kundalini"');
    expect(html).toContain('href="/glossary/pranayama"');
  });

  it('links only the first occurrence of each term', () => {
    const html = renderToString(
      <TermText text="Karma is a loop. Karma repeats. Karma again." />
    );
    const count = (html.match(/href="\/glossary\/karma"/g) || []).length;
    expect(count).toBe(1);
  });

  it('returns plain text when no terms match', () => {
    const html = renderToString(<TermText text="An ordinary sentence about nothing." />);
    expect(html).not.toContain('href');
  });

  it('does not match terms inside larger words', () => {
    const html = renderToString(<TermText text="The Karmamudrā practice is distinct." />);
    expect(html).not.toContain('href="/glossary/karma"');
  });

  it('links a real folio summary (integration)', async () => {
    const { allSiddhis } = await import('@/lib/data/siddhis');
    const folio = allSiddhis.find((s) => s.slug === 'dakshina-kali-sadhana');
    expect(folio).toBeDefined();
    const html = renderToString(<TermText text={folio!.summary} />);
    expect(html).toContain('href="/glossary/');
  });
});
