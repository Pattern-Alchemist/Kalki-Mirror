import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aghor\u012b Tantra Course \u2014 Eight Phases of Transformative Practice | KALKI',
  description:
    'Fifty-four lessons across eight phases \u2014 from foundational orientation through non-dual integration. The most comprehensive online Aghor\u012b Tantra course, grounded in living lineage and scholarly evidence.',
  openGraph: {
    title: 'Aghor\u012b Tantra Course | KALKI',
    description:
      'Fifty-four lessons across eight phases \u2014 from foundational orientation through non-dual integration.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/bhairava-pathway',
        width: 1920,
        alt: 'Aghor\u012b Tantra Course \u2014 KALKI',
      },
    ],
  },
};

export default function AghoriTantraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
