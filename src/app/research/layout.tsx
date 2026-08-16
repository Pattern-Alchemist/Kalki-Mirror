import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/research'),
  title: 'Research',
  description:
    'Evidence-based research on siddhis, tantrik practices, and pattern intelligence. Cross-referenced sources, authenticity scores, and academic citations.',
  openGraph: {
    url: canonicalUrl('/research'),
    title: 'Research | KALKI',
    description:
      'Evidence-based research on siddhis, tantrik practices, and pattern intelligence. Cross-referenced sources, authenticity scores, and academic citations.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/method/forest-path-hero',
        width: 1200,
        height: 630,
        alt: 'Research — KALKI',
      },
    ],
  },
};

const researchJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Research',
      description: 'Evidence-based research on siddhis, tantrik practices, and pattern intelligence. Cross-referenced sources and academic citations.',
      url: `${SITE_URL}/research`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Research', item: `${SITE_URL}/research` },
      ],
    },
  ],
};

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchJsonLd) }}
      />
      {children}
    </>
  );
}
