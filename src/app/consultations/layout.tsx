import type { Metadata } from 'next';
import { canonicalUrl, pageAlternates, SITE_URL } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/consultations'),
  title: 'Consult the Archivist',
  description:
    'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance — in person or remote.',
  openGraph: {
    url: canonicalUrl('/consultations'),
    title: 'Consult the Archivist | KALKI',
    description:
      'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance — in person or remote.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/consult/contemplation-hero',
        width: 1200,
        height: 630,
        alt: 'Consultations — KALKI',
      },
    ],
  },
};

const consultationsJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Consult the Archivist',
      description: 'Book a private consultation with the Archivist. Birth-chart analysis, pattern decoding, siddhi pathway mapping, and tantrik guidance.',
      url: `${SITE_URL}/consultations`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'Service',
      name: 'Tantric Consultation',
      description: 'Private consultation with the Archivist for pattern decoding, siddhi pathway mapping, and tantrik guidance.',
      provider: {
        '@type': 'Organization',
        name: 'KALKI',
        url: SITE_URL,
      },
      serviceType: 'Spiritual Guidance',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Consultations', item: `${SITE_URL}/consultations` },
      ],
    },
  ],
};

export default function ConsultationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(consultationsJsonLd) }}
      />
      {children}
    </>
  );
}
