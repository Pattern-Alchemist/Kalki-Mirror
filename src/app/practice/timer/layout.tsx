import type { Metadata } from 'next';
import { canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/practice/timer'),
  robots: { index: false, follow: true },
  title: 'Silent Sitting Timer',
  description:
    'A minimal meditation timer for unstructured sitting practice. Presets from 5 to 60 minutes with a 528Hz bell on completion.',
  openGraph: {
    title: 'Silent Sitting Timer | KALKI',
    description:
      'Minimal meditation timer for unstructured sitting practice with 528Hz completion bell.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-meditation-platform',
        width: 1200,
        height: 630,
        alt: 'Silent Sitting Timer — KALKI',
      },
    ],
  },
};

export default function TimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
