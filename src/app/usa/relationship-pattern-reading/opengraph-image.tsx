// =============================================================
// KALKI — /usa/relationship-pattern-reading OG image (Vol. 5 #10)
// Bespoke card from the page's own usa-pages data (h1 + accent).
// Node runtime + fs font (see og-factory.tsx header).
// =============================================================

import { ImageResponse } from 'next/og';
import { usaPages, usaHub } from '@/lib/data/usa-pages';
import { buildOgCard, ogImageResponseOptions, OG_SIZE, usaOgCardData } from '@/lib/seo/og-factory';

export const alt = 'Why the Same Relationship Repeats — Pattern Reading | KALKI';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

const page = usaPages.find((p) => p.slug === 'relationship-pattern-reading') ?? usaHub;

export default function Image() {
  return new ImageResponse(
    buildOgCard(usaOgCardData(page)) as never,
    ogImageResponseOptions()
  );
}
