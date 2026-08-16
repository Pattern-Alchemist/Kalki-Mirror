import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/archetypes'),
  title: 'The Ten Mahavidyas',
  description:
    'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari. Discover your dominant patterns, shadow aspects, and growth pathways.',
  openGraph: {
    url: canonicalUrl('/archetypes'),
    title: 'The Ten Mahavidyas | KALKI',
    description:
      'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari. Discover your dominant patterns, shadow aspects, and growth pathways.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/yantra-hero',
        width: 1200,
        height: 630,
        alt: 'The Ten Mahavidyas — KALKI',
      },
    ],
  },
};

const archetypesJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'The Ten Mahāvidyās',
      description: 'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari.',
      url: `${SITE_URL}/archetypes`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      numberOfItems: 16,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'The Ten Mahāvidyās', item: `${SITE_URL}/archetypes` },
      ],
    },
  ],
};

export default function ArchetypesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(archetypesJsonLd) }}
      />
      {children}
    </>
  );
}