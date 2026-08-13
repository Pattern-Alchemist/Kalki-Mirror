import type { Metadata } from 'next';

import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/patterns'),
  title: 'Pattern Atlas — The Mirror Method',
  description:
    '20 recurring human emotional patterns mapped through the Mirror Method. Recognize, confront, dissolve, and integrate the behavioral loops that run your life.',
  openGraph: {
    title: 'Pattern Atlas | KALKI — The Mirror Method',
    description:
      '20 recurring human emotional patterns mapped through the Mirror Method. Recognize, confront, dissolve, and integrate the behavioral loops that run your life.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/patterns/sadhu-ash-gold-hero',
        width: 1200,
        height: 630,
        alt: 'Pattern Atlas — The Mirror Method — KALKI',
      },
    ],
  },
};

const patternsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'Pattern Atlas',
      description: '20 recurring human emotional patterns mapped through the Mirror Method. Four zones: Recognition, Confrontation, Dissolution, Integration.',
      url: `${SITE_URL}/patterns`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: {
        '@type': 'Thing',
        name: 'The Mirror Method',
        description: 'A framework for recognizing, confronting, and dissolving recurring behavioral loops.',
      },
      numberOfItems: 20,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Pattern Atlas', item: `${SITE_URL}/patterns` },
      ],
    },
  ],
};

export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(patternsJsonLd) }}
      />
      {children}
    </>
  );
}
