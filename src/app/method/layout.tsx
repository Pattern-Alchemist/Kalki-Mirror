import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Mirror Method',
  description:
    'The KALKI Mirror Method — a structured framework for self-inquiry drawn from tantrik psychology. Observe, decode, and transform your behavioral patterns.',
  openGraph: {
    title: 'The Mirror Method | KALKI',
    description:
      'The KALKI Mirror Method — a structured framework for self-inquiry drawn from tantrik psychology. Observe, decode, and transform your behavioral patterns.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-observatory-alt',
        width: 1200,
        height: 630,
        alt: 'The Mirror Method — KALKI',
      },
    ],
  },
};

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return children;
}
