import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'YANTRA Dossier',
  description:
    'AI-powered archetype analysis and personalized siddhi dossier. Receive your decoded birth chart, pattern intelligence report, and prescription blueprint.',
  openGraph: {
    title: 'YANTRA Dossier | KALKI',
    description:
      'AI-powered archetype analysis and personalized siddhi dossier. Receive your decoded birth chart, pattern intelligence report, and prescription blueprint.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'YANTRA Dossier — KALKI',
      },
    ],
  },
};

export default function DossierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
