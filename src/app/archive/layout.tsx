import type { Metadata } from 'next';

const SITE_URL = 'https://astrokalki.com';

export const metadata: Metadata = {
  title: 'The Akashic Archive',
  description:
    '48 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. Explore the complete siddhi database.',
  openGraph: {
    title: 'The Akashic Archive | KALKI',
    description:
      'The ancient forbidden archive of consciousness. 48 siddhis, 16 archetypes, tiered access.',
    images: [
      {
        url: '/archive-zone-reading-room.jpeg',
        width: 1344,
        height: 768,
        alt: 'The Akashic Archive — KALKI',
      },
    ],
  },
};

const archiveJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'The Akashic Archive',
  description: '48 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access.',
  url: `${SITE_URL}/archive`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: {
    '@type': 'Thing',
    name: 'Siddhis',
    description: 'Supernatural powers and abilities from the Tantric tradition, documented with evidence grading and scholarly provenance.',
  },
  numberOfItems: 48,
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(archiveJsonLd) }}
      />
      {children}
    </>
  );
}
