// =============================================================
// KALKI — /patterns hub OG image (Vol. 4 #11)
// One brand card for the patterns archive hub. Static data, so the
// card is fully static too. Node runtime + fs font (see og-factory
// header); revalidate is a formality on a code-backed card.
// =============================================================

import { ImageResponse } from 'next/og';
import { allPatterns } from '@/lib/data/patterns';
import { buildOgCard, ogImageResponseOptions, OG_SIZE } from '@/lib/seo/og-factory';

export const alt = 'KALKI — The Patterns Archive';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default function Image() {
  const card = buildOgCard({
    label: 'KALKI · THE PATTERNS ARCHIVE',
    title: 'Name the pattern, end the loop',
    subtitle: `${allPatterns.length} patterns — named loops with mapped exits, from the Rescuer to the Perfectionist.`,
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });
  return new ImageResponse(card as never, ogImageResponseOptions());
}
