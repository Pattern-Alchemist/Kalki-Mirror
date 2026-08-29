import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { allSiddhis } from '@/lib/data/siddhis';

export const metadata: Metadata = {
  title: 'Research & Sources — Epistemic Rigour',
  description: 'Epistemic transparency: every claim sourced, every score explained. Six evidence categories, three scoring dimensions, full provenance chains.',
};

const ResearchPageClient = dynamic(
  () => import('./ResearchPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">EPISTEMIC RIGOUR</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            {'Research & Sources'}
          </h1>
          <p className="text-foreground/70 text-lg md:text-xl max-w-2xl leading-relaxed text-shadow-deep">
            Epistemic transparency: every claim sourced, every score explained.&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function ResearchPage() {
  const totalEvidence = allSiddhis.reduce((sum, s) => sum + s.evidenceCount, 0);
  const avgAuth = Math.round(allSiddhis.reduce((sum, s) => sum + s.authenticityScore, 0) / allSiddhis.length);
  const traditions = [...new Set(allSiddhis.map((s) => s.tradition))];
  const siddhiCount = allSiddhis.length;

  return (
    <ResearchPageClient
      totalEvidence={totalEvidence}
      avgAuth={avgAuth}
      traditions={traditions}
      siddhiCount={siddhiCount}
    />
  );
}
