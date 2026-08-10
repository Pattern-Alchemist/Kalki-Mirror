import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Codex',
  description:
    'The KALKI Codex — a five-part digital manifesto. Digitized palm-leaf manuscript covering the Shambhala Protocol, Mirror Method, and tantrik cosmology.',
  openGraph: {
    title: 'The Codex | KALKI',
    description:
      'The KALKI Codex — a five-part digital manifesto. Digitized palm-leaf manuscript covering the Shambhala Protocol, Mirror Method, and tantrik cosmology.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'The Codex — KALKI',
      },
    ],
  },
};

export default function CodexLayout({ children }: { children: React.ReactNode }) {
  return children;
}
