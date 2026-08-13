import type { Metadata } from 'next';
import { canonicalUrl } from '@/lib/utils/metadata';

// Skip static prerendering for all /practice routes.
// Turbopack SSG has a useMemo resolution bug in the practice
// page's import graph. All practice pages are fully interactive
// (timers, state) and gain nothing from static generation.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/practice') },
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
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/practice/water-practice-hero',
        width: 1200,
        height: 630,
        alt: 'The Practice Floor — KALKI Sadhana Logger',
      },
    ],
  },
};

export default function PracticeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
