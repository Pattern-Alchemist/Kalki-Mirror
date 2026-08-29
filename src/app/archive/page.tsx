import type { Metadata } from 'next';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { siddhiCategoryLabel } from '@/lib/data/tantra-categories';
import { TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import dynamic from 'next/dynamic';
import type { ArchivePageProps } from './ArchivePageClient';

export const metadata: Metadata = {
  title: `The Akashic Archive — ${SIDDHI_COUNT} Siddhis`,
  description: `${SIDDHI_COUNT} siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. The complete Tantric practice reference.`,
};

// Facet counts: public category label -> number of siddhis.
// Only categories that actually hold folios become filter chips —
// this eliminates dead-end filters that render "Showing 0 of 0".
const categoryCounts: Record<string, number> = {};
for (const s of allSiddhis) {
  const label = siddhiCategoryLabel(s.category);
  categoryCounts[label] = (categoryCounts[label] ?? 0) + 1;
}
const categoryFacets = Object.entries(categoryCounts)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .map(([name, count]) => ({ name, count }));

const pageProps: ArchivePageProps = {
  siddhis: allSiddhis,
  siddhiCount: SIDDHI_COUNT,
  mahaVidyas: TEN_MAHAVIDYAS,
  categoryFacets,
};

// Dynamic import defers framer-motion (~40KB) out of
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
  return <ArchivePageClient {...pageProps} />;
}
