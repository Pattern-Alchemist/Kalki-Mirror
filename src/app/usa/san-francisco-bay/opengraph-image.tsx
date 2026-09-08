// =============================================================
// KALKI — /usa/san-francisco-bay OG image (Vol. 5 #15)
// Bespoke card from the page's own usa-pages data (h1 + accent).
// Node runtime + fs font (see og-factory.tsx header).
// =============================================================

import { ImageResponse } from 'next/og';
import { usaCityPages } from '@/lib/data/usa-pages';
import { buildOgCard, ogImageResponseOptions, OG_SIZE, usaOgCardData } from '@/lib/seo/og-factory';

export const alt = 'The Bay optimized everything except the loops — KALKI';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

const page = usaCityPages.find((p) => p.slug === 'san-francisco-bay')!;

export default function Image() {
  return new ImageResponse(
    buildOgCard(usaOgCardData(page)) as never,
    ogImageResponseOptions()
  );
}
