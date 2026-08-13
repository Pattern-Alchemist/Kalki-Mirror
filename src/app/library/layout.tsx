import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  title: 'The Sādhanā Library — Thirty Practice Protocols Across Thirteen Categories',
  description:
    'Structured practice protocols from living lineages — Mantra, Yantra, Nyāsa, Pūjā, Dhāraṇā, Prāṇāyāma, Dhyāna, Dhūni, Śmāśana, Bhasma, Japa, Kuṇḍalinī, Sevā. Evidence-graded. Step-by-step.',
  alternates: { canonical: canonicalUrl('/library') },
  openGraph: {
    url: canonicalUrl('/library'),
    title: 'The Sādhanā Library | KALKI',
    description:
      'Structured practice protocols from living lineages — Mantra, Yantra, Nyāsa, Pūjā, Dhāraṇā, Prāṇāyāma, Dhyāna, Dhūni, Śmāśana, Bhasma, Japa, Kuṇḍalinī, Sevā. Evidence-graded. Step-by-step.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/forgotten-chamber',
        width: 1920,
        height: 1080,
        alt: 'The Sādhanā Library — KALKI',
      },
    ],
  },
};

const libraryJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      name: 'The Sādhanā Library',
      description: 'Thirty practice protocols across thirteen categories from living lineages. Evidence-graded. Step-by-step.',
      url: `${SITE_URL}/library`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      numberOfItems: 30,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Sādhanā Library', item: `${SITE_URL}/library` },
      ],
    },
  ],
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(libraryJsonLd) }}
      />
      {children}
    </>
  );
}
