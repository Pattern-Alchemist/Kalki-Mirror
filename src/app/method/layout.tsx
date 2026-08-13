import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/method') },
  title: 'The Mirror Method',
  description:
    'The KALKI Mirror Method — a structured framework for self-inquiry drawn from tantrik psychology. Observe, decode, and transform your behavioral patterns.',
  openGraph: {
    url: canonicalUrl('/method'),
    title: 'The Mirror Method | KALKI',
    description:
      'The KALKI Mirror Method — a structured framework for self-inquiry drawn from tantrik psychology. Observe, decode, and transform your behavioral patterns.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/method/forest-path-hero',
        width: 1200,
        height: 630,
        alt: 'The Mirror Method — KALKI',
      },
    ],
  },
};

const methodJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'The Mirror Method',
      description: 'A structured framework for self-inquiry drawn from tantrik psychology. Observe, decode, and transform your behavioral patterns.',
      url: `${SITE_URL}/method`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'The Mirror Method', item: `${SITE_URL}/method` },
      ],
    },
  ],
};

export default function MethodLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(methodJsonLd) }}
      />
      {children}
    </>
  );
}
