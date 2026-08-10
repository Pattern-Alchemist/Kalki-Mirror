import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Akashic Archive',
  description:
    '48 siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. Explore the complete siddhi database.',
  openGraph: {
    title: 'The Akashic Archive | KALKI',
    description:
      'The ancient forbidden archive of consciousness. 48 siddhis, 16 archetypes, tiered access.',
    images: [
      {
        url: '/archive-zone-reading-room.jpeg',
        width: 1344,
        height: 768,
        alt: 'The Akashic Archive — KALKI',
      },
    ],
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return children;
}