import type { Metadata } from 'next';
import { glossaryEntries, CATEGORIES } from '@/lib/data/glossary';
import dynamic from 'next/dynamic';
import type { GlossaryEntry } from '@/lib/data/glossary';

export const metadata: Metadata = {
  title: `The Lexicon — ${glossaryEntries.length} Tantric Terms`,
  description: `${glossaryEntries.length} Sanskrit & Tantric terms decoded in the KALKI framework. A cartographic instrument — each term is a coordinate in the map of tantrik psychology.`,
};

const GlossaryPageClient = dynamic(
  () => import('./GlossaryPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28 pt-32">
          <p className="section-label mb-6">REFERENCE SYSTEM</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading">The Lexicon</h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            {glossaryEntries.length} Sanskrit & Tantric terms decoded — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function GlossaryPage() {
  return <GlossaryPageClient entries={glossaryEntries} categories={CATEGORIES} />;
}
