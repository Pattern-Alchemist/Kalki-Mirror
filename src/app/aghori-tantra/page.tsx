import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { aghoriCourse, COURSE_META } from '@/lib/data/aghori-tantra-course';

export const metadata: Metadata = {
  title: 'Aghorī Tantra — The Ashram Path | KALKI',
  description: 'Eight phases. Fifty-four lessons. A lifetime of practice. The complete Aghorī Tantra course from foundational purification to advanced practice.',
};

const AghoriTantraPageClient = dynamic(
  () => import('./AghoriTantraPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">THE ASHRAM PATH</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            Aghorī Tantra
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            Eight phases. Fifty-four lessons.&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function AghoriTantraPage() {
  return <AghoriTantraPageClient aghoriCourse={aghoriCourse} courseMeta={COURSE_META} />;
}
