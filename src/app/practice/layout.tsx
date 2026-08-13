import type { Metadata } from 'next';
import { canonicalUrl, SITE_URL, pageAlternates } from '@/lib/utils/metadata';

// Skip static prerendering for all /practice routes.
// Turbopack SSG has a useMemo resolution bug in the practice
// page's import graph. All practice pages are fully interactive
// (timers, state) and gain nothing from static generation.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: pageAlternates('/practice'),
  robots: { index: false, follow: true },
  title: 'The Practice Floor — Sadhana Logger',
  description:
    'Track your daily sādhana with precision. Log practice sessions, track mood shifts, build streaks, and watch your 90-day practice heatmap illuminate the geometry of transformation.',
  openGraph: {
    url: canonicalUrl('/practice'),
    title: 'The Practice Floor — Sadhana Logger | KALKI',
    description:
      'Track your daily sādhana with precision. Log practice sessions, track mood shifts, build streaks, and watch your 90-day practice heatmap illuminate the geometry of transformation.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/practice/water-practice-hero',
        width: 1200,
        height: 630,
        alt: 'The Practice Floor — KALKI Sadhana Logger',
      },
    ],
  },
};

const practiceJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'The Practice Floor',
      description: 'Track your daily sādhana with precision. Log practice sessions, track mood shifts, build streaks, and watch your 90-day practice heatmap.',
      url: canonicalUrl('/practice'),
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Practice Floor', item: canonicalUrl('/practice') },
      ],
    },
  ],
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(practiceJsonLd) }}
      />
      {children}
    </>
  );
}
