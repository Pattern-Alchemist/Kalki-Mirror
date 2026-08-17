import type { Metadata } from 'next';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: `The Akashic Archive — ${SIDDHI_COUNT} Siddhis | KALKI`,
  description: `${SIDDHI_COUNT} siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. The complete Tantric practice reference.`,
};

// Dynamic import defers framer-motion (~40KB) + all data imports out of
// the critical rendering path. SSR HTML is sacrificed for faster FCP/LCP;
// metadata export handles SEO for search engines.
const ArchivePageClient = dynamic(
  () => import('./ArchivePageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 md:pb-24 w-full">
          <p className="section-label mb-6">The Reading Room</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 engraved-heading font-light max-w-3xl"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            The Akashic Archive
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl editorial-spacing text-shadow-deep">
            {SIDDHI_COUNT} siddhis across 16 archetypes — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function ArchivePage() {
  return <ArchivePageClient />;
}
