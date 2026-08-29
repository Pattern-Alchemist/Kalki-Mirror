import type { Metadata } from 'next';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { CANONICAL } from '@/lib/canonical';
import dynamic from 'next/dynamic';
import type { Pattern } from '@/lib/data/types';
import type { Siddhi } from '@/lib/data/types';

export const metadata: Metadata = {
  title: `Pattern Atlas — ${CANONICAL.patterns} Emotional Patterns | KALKI`,
  description: `${CANONICAL.patterns} core patterns drawn from Aghorī, Kashmiri Shaiva, and Buddhist Vajrayāna traditions — each linked to specific siddhis and prescribed practices.`,
};

const PatternsPageClient = dynamic(
  () => import('./PatternsPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-center justify-center text-center px-6">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-6">THE ATLAS</p>
          <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 hero-heading">
            Pattern Intelligence
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {CANONICAL.patterns} emotional patterns decoded — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function PatternsPage() {
  return <PatternsPageClient patterns={allPatterns} siddhis={allSiddhis} />;
}
