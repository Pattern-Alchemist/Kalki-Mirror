import type { Metadata } from 'next';

import { SITE_URL, canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/breathwork') },
  title: 'Prāṇāyāma Laboratory — KALKI',
  description:
    'Twelve prāṇāyāma techniques from foundational alternate-nostril breath to advanced kevala kumbhaka. Animated breathing visualizer with phase-by-phase guidance.',
  openGraph: {
    title: 'Prāṇāyāma Laboratory | KALKI',
    description:
      'Twelve breathwork patterns with animated visualizer — from Nāḍī Śuddhi to Kevala Kumbhaka.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/cave-yantras',
        width: 1200,
        height: 630,
        alt: 'Prāṇāyāma Laboratory — KALKI',
      },
    ],
  },
};

const breathworkJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Prāṇāyāma Laboratory',
  description:
    'Twelve prāṇāyāma techniques with animated breathing visualizer. From foundational alternate-nostril breath to advanced kevala kumbhaka.',
  url: `${SITE_URL}/breathwork`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: {
    '@type': 'Thing',
    name: 'The Mirror Method',
    description:
      'A framework for recognizing, confronting, and dissolving recurring behavioral loops through traditional sādhana.',
  },
  numberOfItems: 12,
};

export default function BreathworkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breathworkJsonLd) }}
      />
      {children}
    </>
  );
}
