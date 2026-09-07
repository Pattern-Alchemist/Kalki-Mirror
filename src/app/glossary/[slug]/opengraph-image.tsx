// =============================================================
// KALKI — /glossary/[slug] OG image (Vol. 4 #11)
// -------------------------------------------------------------
// One bespoke card per lexicon term (86 today). Same data + slug
// truth as the term page: termAnchor over glossaryEntries, unknown
// slug falls back to the Lexicon's brand card (the term page itself
// 404s — OG consumers only ever follow URLs the page rendered).
// Node runtime + fs font (see og-factory.tsx header for why not
// edge); revalidate = 86400 (corpus is code, not DB).
// =============================================================

import { ImageResponse } from 'next/og';
import { glossaryEntries, CATEGORIES } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';
import { buildOgCard, ogImageResponseOptions, OG_SIZE } from '@/lib/seo/og-factory';

export const alt = 'KALKI — The Lexicon';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = glossaryEntries.find((e) => termAnchor(e.term) === slug);
  const categoryLabel = entry
    ? (CATEGORIES.find((c) => c.value === entry.category)?.label ?? entry.category)
    : undefined;

  const card = buildOgCard({
    label: 'KALKI · THE LEXICON',
    title: entry?.term ?? 'The Lexicon',
    subtitle: entry
      ? `${categoryLabel ? `${categoryLabel} — ` : ''}${entry.definition}`
      : 'Sanskrit & Tantric terms decoded in the KALKI framework.',
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });

  return new ImageResponse(card as never, ogImageResponseOptions());
}
