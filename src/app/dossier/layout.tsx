import type { Metadata } from 'next';
import { canonicalUrl, SITE_URL, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/dossier'),
  robots: { index: false, follow: true },
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
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/dossier/sadhu-ash-gold-hero',
        width: 1200,
        height: 630,
        alt: 'Consultation Dossier — KALKI',
      },
    ],
  },
};

const dossierJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Consultation Dossier',
      description: 'Retrieve your consultation dossier — pattern diagnosis, prescribed path, session notes, and outcome tracking.',
      url: canonicalUrl('/dossier'),
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Dossier', item: canonicalUrl('/dossier') },
      ],
    },
  ],
};

export default function DossierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(dossierJsonLd) }}
      />
      {children}
    </>
  );
}
