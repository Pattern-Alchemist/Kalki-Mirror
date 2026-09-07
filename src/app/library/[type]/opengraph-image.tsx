// =============================================================
// KALKI — /library/[type] OG image (Vol. 4 #11)
// One card per studio type shelf (the closed five-type set). DB-free
// by design: the shelf LISTING is live, but the card is brand-level —
// label + type + discipline line. An unknown type renders the generic
// library card (the page itself 404s + noindexes; OG consumers only
// follow URLs the page rendered — documented decision, not a hole).
// =============================================================

import { ImageResponse } from 'next/og';
import {
  buildOgCard,
  ogImageResponseOptions,
  OG_SIZE,
  OG_LIBRARY_TYPE_COPY,
} from '@/lib/seo/og-factory';
import { isPublicContentType } from '@/lib/seo/content-seo';

export const alt = 'KALKI — The Sādhanā Library';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const known = isPublicContentType(type);
  const copy = known ? OG_LIBRARY_TYPE_COPY[type] : undefined;

  const card = buildOgCard({
    label: 'KALKI · THE SĀDHANĀ LIBRARY',
    title: copy?.title ?? 'The Sādhanā Library',
    subtitle: copy?.subtitle ?? 'The studio corpus — published under the evidence-first discipline.',
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });

  return new ImageResponse(card as never, ogImageResponseOptions());
}
