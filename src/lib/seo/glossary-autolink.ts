// =============================================================
// KALKI — LEXICON AUTO-LINKER (pure, Vol. 4 #9)
// -------------------------------------------------------------
// The 86 term pages carried DefinedTerm + BreadcrumbList but the
// definition BODIES mentioned other terms as plain text — the
// crawl graph was a star, not a web. This lib turns a body into
// link/plain segments: the first occurrence of every OTHER term
// becomes a real link to its Lexicon page.
//
// Extracted verbatim from TermText (Vol. 3 #4, which already
// links folio and pattern prose) so the component, the glossary
// term pages and the tests share ONE matcher. Pure functions
// only — no React, no DB.
//
// Rules carried over from the TermText matcher:
//   · longest-first alternation ("Prāṇāyāma" wins over "Prāṇa")
//   · Unicode word boundaries ("Karma" never matches inside
//     "Karmamudrā", "Oṃ" never inside "Oṃkāra")
//   · case-insensitive, first mention per term only
//   · `exclude` suppresses self-links (a term's own page must
//     not link itself)
// =============================================================

import { glossaryEntries } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';

export interface TermLinkSegment {
  /** The raw text of the segment. */
  text: string;
  /** Canonical term when this segment is a LINK, absent for plain text. */
  term?: string;
  /** Lexicon anchor (termAnchor of the term) when this segment is a LINK. */
  anchor?: string;
}

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

/**
 * Split `text` into link/plain segments. Every glossary term occurrence
 * is linked at its FIRST mention only; repeats and matches inside other
 * words stay plain. `opts.exclude` (a term name) never links itself.
 */
export function linkTermSegments(
  text: string,
  opts?: { exclude?: string }
): TermLinkSegment[] {
  const excludeAnchor = opts?.exclude ? termAnchor(opts.exclude) : undefined;
  const linked = new Set<string>();
  const segments: TermLinkSegment[] = [];
  let last = 0;

  // matchAll clones the regex internally — module-level TERM_PATTERN is never mutated.
  for (const match of text.matchAll(TERM_PATTERN)) {
    const [full, term] = match;
    const canonical = glossaryEntries.find(
      (e) => e.term.toLowerCase() === term.toLowerCase()
    );
    if (!canonical) continue;

    const anchor = termAnchor(canonical.term);
    if (excludeAnchor && anchor === excludeAnchor) continue;
    if (linked.has(anchor)) continue;
    linked.add(anchor);

    const start = match.index;
    if (start > last) segments.push({ text: text.slice(last, start) });

    segments.push({ text: full, term: canonical.term, anchor });
    last = start + full.length;
  }

  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

/** How many distinct term links a body would receive (self-excluded). */
export function countTermLinks(text: string, opts?: { exclude?: string }): number {
  return linkTermSegments(text, opts).filter((s) => s.term).length;
}
