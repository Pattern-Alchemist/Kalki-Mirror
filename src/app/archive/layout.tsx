import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Akashic Archive',
  description:
    '41 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. Explore the complete siddhi database.',
  openGraph: {
    title: 'The Akashic Archive | KALKI',
    description:
      '41 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. Explore the complete siddhi database.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-underground-library',
        width: 1200,
        height: 630,
        alt: 'The Akashic Archive — KALKI',
      },
    ],
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}
