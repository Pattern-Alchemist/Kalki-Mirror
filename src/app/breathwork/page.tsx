import type { Metadata } from 'next';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Breathwork — Prāṇāyāma Protocols | KALKI',
  description: `Guided prāṇāyāma protocols from the Tantric tradition. ${allBreathPatterns.length} breath patterns for channel purification, energetic activation, and meditative absorption.`,
};

const BreathworkPageClient = dynamic(
  () => import('./BreathworkPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-center justify-center text-center px-6">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-6">PRĀṆĀYĀMA</p>
          <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 hero-heading uppercase">
            Breathwork
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            {allBreathPatterns.length} breath patterns — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function BreathworkPage() {
  return <BreathworkPageClient />;
}