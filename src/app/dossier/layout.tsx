import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/dossier') },
  title: 'Consultation Dossier',
  description:
    'Retrieve your consultation dossier — pattern diagnosis, prescribed path, session notes, and outcome tracking. Your living record of evolution through the KALKI Archive.',
  openGraph: {
    url: canonicalUrl('/dossier'),
    title: 'Consultation Dossier | KALKI',
    description:
      'Retrieve your consultation dossier — pattern diagnosis, prescribed path, session notes, and outcome tracking. Your living record of evolution through the KALKI Archive.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-ritual-chamber-alt',
        width: 1200,
        height: 630,
        alt: 'Consultation Dossier — KALKI',
      },
    ],
  },
};

export default function DossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
