import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/glossary'),
  title: 'The Lexicon',
  description:
    '50+ Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās — the vocabulary of consciousness transformation.',
  openGraph: {
    url: canonicalUrl('/glossary'),
    title: 'The Lexicon | KALKI',
    description:
      '50+ Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās — the vocabulary of consciousness transformation.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ancient-manuscripts',
        width: 1200,
        height: 630,
        alt: 'The Lexicon — KALKI',
      },
    ],
  },
};

const glossaryJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'The Lexicon',
      description: '50+ Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās.',
      url: `${SITE_URL}/glossary`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'The Lexicon', item: `${SITE_URL}/glossary` },
      ],
    },
  ],
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryJsonLd) }}
      />
      {children}
    </>
  );
}
