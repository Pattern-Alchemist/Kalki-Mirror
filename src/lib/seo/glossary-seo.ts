// =============================================================
// KALKI — LEXICON TERM PAGES (SEO graph helpers, Vol. 3 #4)
// -------------------------------------------------------------
// The 86 Lexicon terms graduate from #anchors on one hub page to
// programmatic /glossary/[slug] pages. Slugs are derived by the
// SAME termAnchor() that mints hub anchors — a term's anchor and
// its page slug can never disagree.
//
// Pure functions only (no React, no DB) so the sitemap, the
// pages, the auto-linker and the tests all share one truth.
// =============================================================

import { glossaryEntries, type GlossaryEntry } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';
import { SITE_URL } from '@/lib/utils/metadata';

/** URL path of a term's programmatic page, e.g. `/glossary/kundalini`. */
export function glossaryTermPath(term: string): string {
  return `/glossary/${termAnchor(term)}`;
}

/** Resolves a related-term name to its entry (case-insensitive), if it exists. */
export function resolveRelatedTerm(name: string): GlossaryEntry | undefined {
  return glossaryEntries.find((e) => e.term.toLowerCase() === name.toLowerCase());
}

/**
 * JSON-LD graph for a term page: DefinedTerm (addressable at its own
 * URL, still a member of the hub's DefinedTermSet) + BreadcrumbList.
 * Mirrors — and must stay consistent with — the hub layout's
 * DefinedTermSet graph, which now carries `url` per term too.
 */
export function glossaryTermJsonLd(entry: GlossaryEntry) {
  const url = `${SITE_URL}${glossaryTermPath(entry.term)}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        name: entry.term,
        alternateName: entry.sanskrit,
        description: entry.definition,
        url,
        termCode: termAnchor(entry.term),
        inDefinedTermSet: { '@id': `${SITE_URL}/glossary#termset` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'The Lexicon', item: `${SITE_URL}/glossary` },
          { '@type': 'ListItem', position: 3, name: entry.term, item: url },
        ],
      },
    ],
  };
}
