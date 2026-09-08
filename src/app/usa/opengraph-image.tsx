// =============================================================
// KALKI — /usa hub OG image (Vol. 5 #10)
// -------------------------------------------------------------
// The USA layer's brand card (hub + five service pages carry
// bespoke siblings). Copy derives from usa-pages data — the same
// h1 / h1Accent sentence pair the page renders. Node runtime + fs
// font (see og-factory.tsx header for why not edge).
// =============================================================

import { ImageResponse } from 'next/og';
import { usaHub } from '@/lib/data/usa-pages';
import { buildOgCard, ogImageResponseOptions, OG_SIZE, usaOgCardData } from '@/lib/seo/og-factory';

export const alt = 'KALKI — for seekers in the United States';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default function Image() {
  return new ImageResponse(
    buildOgCard(usaOgCardData(usaHub)) as never,
    ogImageResponseOptions()
  );
}
