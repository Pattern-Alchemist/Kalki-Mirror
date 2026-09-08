// =============================================================
// KALKI — /archive/[slug] OG image (Vol. 5 #10)
// -------------------------------------------------------------
// One bespoke card per siddhi folio (56 today). Same data + slug
// truth as the folio page: getSiddhiBySlug over allSiddhis, unknown
// slug falls back to the Archive's brand card (the folio page itself
// 404s — OG consumers only ever follow URLs the page rendered).
// Node runtime + fs font (see og-factory.tsx header for why not
// edge); revalidate = 86400 (corpus is code, not DB).
// =============================================================

import { ImageResponse } from 'next/og';
import { getSiddhiBySlug } from '@/lib/data/siddhis';
import { buildOgCard, ogImageResponseOptions, OG_SIZE } from '@/lib/seo/og-factory';

export const alt = 'KALKI — The Akashic Archive';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siddhi = getSiddhiBySlug(slug);

  const card = buildOgCard({
    label: 'KALKI · THE AKASHIC ARCHIVE',
    title: siddhi?.name ?? 'The Akashic Archive',
    subtitle: siddhi
      ? `${siddhi.category.charAt(0).toUpperCase()}${siddhi.category.slice(1)} — ${siddhi.summary}`
      : 'Siddhi folios with evidence sources, authenticity scores and lineage — the complete archive.',
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });

  return new ImageResponse(card as never, ogImageResponseOptions());
}
