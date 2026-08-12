import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/archetypes') },
  title: 'The Ten Mahavidyas',
  description:
    'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari. Discover your dominant patterns, shadow aspects, and growth pathways.',
  openGraph: {
    title: 'The Ten Mahavidyas | KALKI',
    description:
      'Decode the 16 archetypes of tantrik psychology — from Kali to Bhuvaneshvari. Discover your dominant patterns, shadow aspects, and growth pathways.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'The Ten Mahavidyas — KALKI',
      },
    ],
  },
};

export default function ArchetypesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
