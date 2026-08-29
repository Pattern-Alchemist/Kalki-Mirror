import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { COURSE_LESSON_COUNT } from '@/lib/data/aghori-tantra-course';

const COURSE_DESCRIPTION =
  `${COURSE_LESSON_COUNT} lessons across eight phases — from foundational orientation through non-dual integration. The most comprehensive online Aghorī Tantra course, grounded in living lineage and scholarly evidence.`;

export const metadata: Metadata = {
  title: 'Aghorī Tantra Course — Eight Phases of Transformative Practice',
  description: COURSE_DESCRIPTION,
  alternates: pageAlternates('/aghori-tantra'),
  openGraph: {
    url: canonicalUrl('/aghori-tantra'),
    title: 'Aghorī Tantra Course | KALKI',
    description: COURSE_DESCRIPTION,
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/aghori-tantra/shmashana-hero',
        width: 1200,
        height: 630,
        alt: 'Aghorī Tantra Course — KALKI',
      },
    ],
  },
};

const aghoriJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      name: 'Aghorī Tantra Course',
      description: `${COURSE_LESSON_COUNT} lessons across eight phases — from foundational orientation through non-dual integration.`,
      url: `${SITE_URL}/aghori-tantra`,
      provider: { '@id': `${SITE_URL}/#organization` },
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Aghorī Tantra Course', item: `${SITE_URL}/aghori-tantra` },
      ],
    },
  ],
};

export default function AghoriTantraLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aghoriJsonLd) }}
      />
      {children}
    </>
  );
}
