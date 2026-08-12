import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/practice') },
  title: 'Sadhana Instruments',
  description:
    'Breath timers, pranayama tools, and guided sadhana instruments calibrated to tantrik rhythms. Build your daily practice with precision.',
  openGraph: {
    title: 'Sadhana Instruments | KALKI',
    description:
      'Breath timers, pranayama tools, and guided sadhana instruments calibrated to tantrik rhythms. Build your daily practice with precision.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-meditation-platform',
        width: 1200,
        height: 630,
        alt: 'Sadhana Instruments — KALKI',
      },
    ],
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
