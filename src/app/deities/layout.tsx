import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/deities'),
  title: 'The Pantheon',
  description:
    'The Deity Compendium — 16 archetypal forces of the KALKI system. The Ten Mahāvidyās and six supplementary archetypes, each governing a specific karmic-loop pattern.',
  openGraph: {
    url: canonicalUrl('/deities'),
    title: 'The Pantheon | KALKI',
    description:
      'The Deity Compendium — 16 archetypal forces of the KALKI system. The Ten Mahāvidyās and six supplementary archetypes, each governing a specific karmic-loop pattern.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-dark-temple-interior',
        width: 1200,
        height: 630,
        alt: 'The Pantheon — KALKI',
      },
    ],
  },
};

const deitiesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'The Pantheon',
      description: 'The Deity Compendium — 16 archetypal forces of the KALKI system. The Ten Mahāvidyās and six supplementary archetypes.',
      url: `${SITE_URL}/deities`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      numberOfItems: 16,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'The Pantheon', item: `${SITE_URL}/deities` },
      ],
    },
  ],
};

export default function DeitiesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(deitiesJsonLd) }}
      />
      {children}
    </>
  );
}
