import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/redeem') },
  robots: { index: false, follow: true },
  title: 'Key Redemption',
  description:
    'Activate your Golden Key to unlock deeper access to the Akashic Archive. Enter your KALKI key code to upgrade your covenant tier.',
  openGraph: {
    url: canonicalUrl('/redeem'),
    title: 'Key Redemption | KALKI',
    description:
      'Activate your Golden Key to unlock deeper access to the Akashic Archive. Enter your KALKI key code to upgrade your covenant tier.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'Key Redemption — KALKI',
      },
    ],
  },
};

export default function RedeemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
