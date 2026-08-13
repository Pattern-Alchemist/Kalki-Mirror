import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/deities') },
  title: 'The Pantheon',
  description:
    'The Deity Compendium — 16 archetypal forces of the KALKI system. The Ten Mahāvidyās and six supplementary archetypes, each governing a specific karmic-loop pattern.',
  openGraph: {
    url: SITE_URL + '/deities',
    title: 'The Pantheon | KALKI',
    description:
      '16 archetypal forces mapped: the Ten Mahāvidyās and six supplementary archetypes, each governing a karmic-loop pattern.',
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

export default function DeitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
