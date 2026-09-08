// =============================================================
// KALKI — /sequences/[slug] OG image (Vol. 5 #10)
// -------------------------------------------------------------
// One bespoke card per practice sequence (7 today). Same data +
// slug truth as the sequence page: getSequenceBySlug over
// allSequences, unknown slug falls back to the brand card (the
// sequence page itself 404s — OG consumers only ever follow URLs
// the page rendered). Node runtime + fs font (see og-factory.tsx
// header for why not edge); revalidate = 86400.
// =============================================================

import { ImageResponse } from 'next/og';
import { getSequenceBySlug } from '@/lib/data/sequences';
import { buildOgCard, ogImageResponseOptions, OG_SIZE } from '@/lib/seo/og-factory';

export const alt = 'KALKI — Practice Sequences';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sequence = getSequenceBySlug(slug);

  const card = buildOgCard({
    label: 'KALKI · PRACTICE SEQUENCES',
    title: sequence?.name ?? 'Practice Sequences',
    subtitle: sequence
      ? `${sequence.subtitle} — ${sequence.totalDuration}`
      : 'Multi-stage sādhana protocols chaining specific siddhis into coherent arcs.',
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });

  return new ImageResponse(card as never, ogImageResponseOptions());
}
