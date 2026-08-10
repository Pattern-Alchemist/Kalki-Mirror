import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pattern Intelligence',
  description:
    'Decode your behavioral loops, shadow patterns, and repeating karmic signatures. Real-time pattern recognition for self-awareness and transformation.',
  openGraph: {
    title: 'Pattern Intelligence | KALKI',
    description:
      'Decode your behavioral loops, shadow patterns, and repeating karmic signatures. Real-time pattern recognition for self-awareness and transformation.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-mountain-trident',
        width: 1200,
        height: 630,
        alt: 'Pattern Intelligence — KALKI',
      },
    ],
  },
};

export default function PatternsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
