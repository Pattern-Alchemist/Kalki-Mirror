import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pattern Atlas — The Mirror Method',
  description:
    '12 recurring human emotional patterns mapped through the Mirror Method. Recognize, confront, and dissolve the behavioral loops that run your life.',
  openGraph: {
    title: 'Pattern Atlas | KALKI — The Mirror Method',
    description:
      '12 recurring human emotional patterns mapped through the Mirror Method. Recognize, confront, and dissolve the behavioral loops that run your life.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/pattern-atlas/zone-mirror',
        width: 1200,
        height: 630,
        alt: 'Pattern Atlas — The Mirror Method — KALKI',
      },
    ],
  },
};

export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
