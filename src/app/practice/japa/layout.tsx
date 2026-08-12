import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/practice/japa') },
  title: 'Japa Mala',
  description:
    'Count your mantra repetitions with the digital Japa Mala. Supports Om Namah Shivaya, Om Mani Padme Hum, Hare Krishna, and custom mantras. Target 54, 108, 216, or 1008 repetitions.',
  openGraph: {
    title: 'Japa Mala | KALKI',
    description:
      'Digital Japa Mala counter for mantra repetition. Supports multiple mantras with session history persistence.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-meditation-platform',
        width: 1200,
        height: 630,
        alt: 'Japa Mala — KALKI',
      },
    ],
  },
};

export default function JapaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
