import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Four Paths, One Purpose',
  description:
    'Four membership tiers — Seeker, Adept, Initiate, and Sovereign. Each unlocks deeper layers of the Akashic Archive, consultations, and live satsang.',
  openGraph: {
    title: 'Four Paths, One Purpose | KALKI',
    description:
      'Four membership tiers — Seeker, Adept, Initiate, and Sovereign. Each unlocks deeper layers of the Akashic Archive, consultations, and live satsang.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-labyrinth-alt',
        width: 1200,
        height: 630,
        alt: 'Membership Tiers — KALKI',
      },
    ],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
