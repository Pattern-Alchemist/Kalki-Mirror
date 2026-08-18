import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { allSequences } from '@/lib/data/sequences';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';

export const metadata: Metadata = {
  title: 'Practice Sequences — Sādhana Protocols | KALKI',
  description: 'Multi-stage sādhana protocols chaining specific siddhis into coherent arcs designed to dissolve targeted emotional patterns.',
};

const SequencesPageClient = dynamic(
  () => import('./SequencesPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-center justify-center text-center px-6">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-6">Sādhana Protocols</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground leading-[0.95] tracking-[0.08em] mb-6 hero-heading uppercase">
            Practice Sequences
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Multi-stage sādhana protocols — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function SequencesPage() {
  return <SequencesPageClient sequences={allSequences} siddhis={allSiddhis} patterns={allPatterns} />;
}
