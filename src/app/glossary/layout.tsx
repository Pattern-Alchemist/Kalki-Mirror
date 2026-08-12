import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/glossary') },
  title: 'The Lexicon',
  description:
    '50+ Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās — the vocabulary of consciousness transformation.',
  openGraph: {
    title: 'The Lexicon | KALKI',
    description:
      '50+ Sanskrit and Tantric terms defined in the KALKI framework. The vocabulary of consciousness transformation.',
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

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
