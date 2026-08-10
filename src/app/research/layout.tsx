import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research',
  description:
    'Evidence-based research on siddhis, tantrik practices, and pattern intelligence. Cross-referenced sources, authenticity scores, and academic citations.',
  openGraph: {
    title: 'Research | KALKI',
    description:
      'Evidence-based research on siddhis, tantrik practices, and pattern intelligence. Cross-referenced sources, authenticity scores, and academic citations.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'Research — KALKI',
      },
    ],
  },
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
