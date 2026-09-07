import Link from 'next/link';
import type { ReactNode } from 'react';
import { linkTermSegments } from '@/lib/seo/glossary-autolink';

/**
 * TermText — the Lexicon auto-linker (component half).
 *
 * The matcher lives in src/lib/seo/glossary-autolink.ts (Vol. 4 #9) so
 * the glossary term pages, this component and the tests share ONE truth.
 * The first occurrence of each term is linked; repeats stay plain to
 * keep prose quiet. `excludeTerm` suppresses self-links — a term's own
 * page renders its name unlinked.
 *
 * Since Vol. 3 #4 each term has a programmatic page at /glossary/[slug]
 * (slug derived by termAnchor, the same function that mints the hub's
 * #anchors) — prose links those pages, so every folio, pattern and
 * Lexicon definition becomes internal-link equity for the 86 indexable
 * term URLs.
 */

const LINK_CLASS =
  'text-gold underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-colors';

export function TermText({
  text,
  className,
  excludeTerm,
}: {
  text: string;
  className?: string;
  excludeTerm?: string;
}): ReactNode {
  const segments = linkTermSegments(text, excludeTerm ? { exclude: excludeTerm } : undefined);
  if (segments.length === 0) return text;
  if (segments.every((s) => !s.term)) return text;

  return (
    <span className={className}>
      {segments.map((s, i) =>
        s.term && s.anchor ? (
          <Link key={i} href={`/glossary/${s.anchor}`} className={LINK_CLASS}>
            {s.text}
          </Link>
        ) : (
          s.text
        )
      )}
    </span>
  );
}
