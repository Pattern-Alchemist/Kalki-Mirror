import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consult the Archivist',
  description:
    'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance — in person or remote.',
  openGraph: {
    title: 'Consult the Archivist | KALKI',
    description:
      'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance — in person or remote.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-cremation-ground-alt',
        width: 1200,
        height: 630,
        alt: 'Consultations — KALKI',
      },
    ],
  },
};

export default function ConsultationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
