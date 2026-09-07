import type { Metadata } from 'next';

import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { allPatterns } from '@/lib/data/patterns';

export const metadata: Metadata = {
  alternates: pageAlternates('/patterns'),
  title: 'Pattern Atlas — The Mirror Method',
  description:
    '20 recurring human emotional patterns mapped through the Mirror Method. Recognize, confront, dissolve, and integrate the behavioral loops that run your life.',
  openGraph: {
    title: 'Pattern Atlas | KALKI — The Mirror Method',
    description:
      '20 recurring human emotional patterns mapped through the Mirror Method. Recognize, confront, dissolve, and integrate the behavioral loops that run your life.',
    // Vol. 4 #11: og:image comes from the sibling opengraph-image.tsx —
    // the old static Cloudinary mirror-hero is retired so the card
    // truth lives in exactly one place.
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
    {
      '@type': 'ItemList',
      name: 'Pattern Atlas — The Mirror Method',
      description: '20 emotional patterns mapped to specific tantrik sadhanas',
      numberOfItems: allPatterns.length,
      itemListElement: allPatterns.map(function(p, i) {
        return {
          '@type': 'ListItem',
          position: i + 1,
          name: p.name,
          url: 'https://www.astrokalki.com/patterns/' + p.slug,
        };
      }),
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
