// =============================================================
// KALKI — /archetypes/[id] OG image (Vol. 5 #10)
// -------------------------------------------------------------
// One bespoke card per Mahāvidyā folio (10 serve pages — the six
// supplementary pantheon forces remain on the hub by design).
// Same data + id truth as the page: getArchetypeById + the
// MAHAVIDYA_CONTENT join; a miss (or a supplementary id with no
// page) falls back to the brand card — the folio page itself 404s,
// OG consumers only ever follow URLs the page rendered. The old
// raw Cloudinary art share-image is retired from metadata; og:image
// truth now lives in exactly one place. Node runtime + fs font
// (see og-factory.tsx header for why not edge); revalidate = 86400.
// =============================================================

import { ImageResponse } from 'next/og';
import { getArchetypeById } from '@/lib/data/archetypes';
import { MAHAVIDYA_CONTENT } from '@/lib/data/mahavidya-content';
import { buildOgCard, ogImageResponseOptions, OG_SIZE } from '@/lib/seo/og-factory';

export const alt = 'KALKI — Archetypes, the Ten Mahāvidyās';
export const size = OG_SIZE;
export const contentType = 'image/png';
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const archetype = getArchetypeById(id);
  const content = MAHAVIDYA_CONTENT[id];
  const served = Boolean(archetype && content);

  const card = buildOgCard({
    label: 'KALKI · THE MAHAVIDYAS',
    title: served ? (archetype?.name ?? 'The Ten Mahāvidyās') : 'The Ten Mahāvidyās',
    subtitle: archetype
      ? archetype.pattern
      : 'The ten great wisdom forces — archetype folios with textual sources and the diagnostic loop each governs.',
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  });

  return new ImageResponse(card as never, ogImageResponseOptions());
}
