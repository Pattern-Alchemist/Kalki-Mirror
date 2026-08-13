import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/codex') },
  title: 'The Codex',
  description:
    'The KALKI Codex — a five-part digital manifesto covering the Shambhala Protocol, Mirror Method, and tantrik cosmology. The foundational text of the KALKI system.',
  openGraph: {
    title: 'The Codex | KALKI',
    url: canonicalUrl('/codex'),
    description:
      'The KALKI Codex — a five-part digital manifesto covering the Shambhala Protocol, Mirror Method, and tantrik cosmology. The foundational text of the KALKI system.',
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
