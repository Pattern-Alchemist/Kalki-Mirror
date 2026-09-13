// =============================================================
// KALKI — /letters/[slug] OG image (Vol. 6 #12)
// -------------------------------------------------------------
// One bespoke card per published letter. Same data truth as the
// letter page: db.letter.findFirst by (slug, isPublic:true). Unknown
// slug falls back to the Letters brand card. Node runtime + fs font
// (see og-factory.tsx header for why not edge); revalidate = 0
// (letters are broadcast-paced — a handful of rows, fresh on each
// share request so a freshly-published letter's card is never stale).
// =============================================================

import { ImageResponse } from 'next/og';
import { db } from '@/lib/db';
import { buildOgCard, ogImageResponseOptions, OG_SIZE, letterOgCardData } from '@/lib/seo/og-factory';

export const alt = 'KALKI — Letters';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 0;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const letter = await db.letter.findFirst({
    where: { slug, isPublic: true },
    select: { subject: true, body: true },
  }).catch(() => null);

  const card = buildOgCard(
    letter
      ? letterOgCardData(letter)
      : {
          label: 'KALKI · LETTERS',
          title: 'The Letters',
          subtitle: 'Broadcasts from the KALKI archive.',
          footer: 'EVIDENCE-FIRST TANTRA · KALKI',
        },
  );

  return new ImageResponse(card as never, ogImageResponseOptions());
}
