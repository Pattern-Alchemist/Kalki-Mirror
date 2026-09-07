// =============================================================
// KALKI — /patterns/[slug] OG image (Vol. 4 #11)
// One bespoke card per pattern folio (20 today). Same slug truth as
// the folio page; unknown slug falls back to the hub card (the folio
// itself 404s — OG consumers only follow rendered URLs).
// =============================================================

import { ImageResponse } from 'next/og';
import { allPatterns } from '@/lib/data/patterns';
import { buildOgCard, ogImageResponseOptions, OG_SIZE } from '@/lib/seo/og-factory';

export const alt = 'KALKI — Pattern Study';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pattern = allPatterns.find((p) => p.slug === slug);

  const card = buildOgCard({
    label: 'KALKI · PATTERN STUDY',
    title: pattern ? pattern.name : 'The Patterns Archive',
    subtitle: pattern ? pattern.subtitle : 'Named loops with mapped exits.',
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });

  return new ImageResponse(card as never, ogImageResponseOptions());
}
