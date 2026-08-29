import Link from 'next/link';
import type { ReactNode } from 'react';
import { glossaryEntries } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';

/**
 * TermText — the Lexicon auto-linker.
 *
 * Renders a plain-text string with every glossary term it contains linked
 * to its Lexicon anchor. The first occurrence of each term is linked;
 * repeats stay plain to keep prose quiet.
 *
 * The matcher is compiled once at module load: all {glossaryEntries.length}
 * terms, longest-first (so "Prāṇāyāma" wins over "Prāṇa"), with Unicode-aware
 * boundaries so "Karma" does not match inside "Karmamudrā" and "Oṃ" does not
 * match inside "Oṃkāra".
 */

const LINK_CLASS =
  'text-gold underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-colors';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Longest-first so longer terms take precedence in alternation order.
const SORTED_TERMS = [...glossaryEntries]
  .map((e) => e.term)
  .sort((a, b) => b.length - a.length);

const TERM_PATTERN = new RegExp(
  `(?<![\\p{L}\\p{N}])(${SORTED_TERMS.map(escapeRegExp).join('|')})(?![\\p{L}\\p{N}])`,
  'giu'
);

export function TermText({ text, className }: { text: string; className?: string }): ReactNode {
  const linked = new Set<string>();
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;

  // matchAll clones the regex internally — module-level TERM_PATTERN is never mutated.
  for (const match of text.matchAll(TERM_PATTERN)) {
    const [full, term] = match;
    const canonical = glossaryEntries.find(
      (e) => e.term.toLowerCase() === term.toLowerCase()
    );
    if (!canonical) continue;

    const anchor = termAnchor(canonical.term);
    if (linked.has(anchor)) continue;
    linked.add(anchor);

    const start = match.index;
    if (start > last) nodes.push(text.slice(last, start));

    nodes.push(
      <Link key={key++} href={`/glossary#${anchor}`} className={LINK_CLASS}>
        {full}
      </Link>
    );
    last = start + full.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  if (nodes.length === 0) return text;

  return <span className={className}>{nodes}</span>;
}
