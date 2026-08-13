import type { Metadata } from 'next';

import { SITE_URL, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/archive'),
  title: 'The Akashic Archive',
  description:
    '48 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. Explore the complete siddhi database.',
  openGraph: {
    title: 'The Akashic Archive | KALKI',
    url: canonicalUrl('/archive'),
    description:
      '48 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. Explore the complete siddhi database.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/archive/sacred-geometry-manuscript',
        width: 1200,
        height: 630,
        alt: 'The Akashic Archive — KALKI',
      },
    ],
  },
};

const archiveJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
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
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Akashic Archive', item: `${SITE_URL}/archive` },
      ],
    },
  ],
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
