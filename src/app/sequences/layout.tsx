import type { Metadata } from 'next';

import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/sequences'),
  title: 'Practice Sequences — The Mirror Method',
  description:
    'Six curated multi-stage sādhana protocols that chain specific siddhis into coherent arcs designed to dissolve targeted emotional patterns.',
  openGraph: {
    title: 'Practice Sequences | KALKI — The Mirror Method',
    description:
      'Six curated multi-stage sādhana protocols that chain specific siddhis into coherent arcs designed to dissolve targeted emotional patterns.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/patterns/sadhu-ash-gold-hero',
        width: 1200,
        height: 630,
        alt: 'Practice Sequences — KALKI',
      },
    ],
  },
};

const sequencesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'Practice Sequences',
      description:
        'Six curated sādhana protocols chaining specific siddhis into coherent arcs for dissolving targeted emotional patterns.',
      url: `${SITE_URL}/sequences`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: {
        '@type': 'Thing',
        name: 'The Mirror Method',
        description:
          'A framework for recognizing, confronting, and dissolving recurring behavioral loops through traditional sādhana.',
      },
      numberOfItems: 6,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Practice Sequences', item: `${SITE_URL}/sequences` },
      ],
    },
  ],
};

export default function SequencesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sequencesJsonLd) }}
      />
      {children}
    </>
  );
}
