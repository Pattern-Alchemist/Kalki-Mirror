import type { Metadata } from 'next';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { TANTRA_CATEGORIES } from '@/lib/data/tantra-categories';
import { TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import dynamic from 'next/dynamic';
import type { ArchivePageProps } from './ArchivePageClient';

export const metadata: Metadata = {
  title: `The Akashic Archive — ${SIDDHI_COUNT} Siddhis | KALKI`,
  description: `${SIDDHI_COUNT} siddhis across 16 archetypes — evidence sources, authenticity scores, lineage, and tiered access. The complete Tantric practice reference.`,
};

// Pre-compute resolveCategory map so client doesn't need the TANTRA_CATEGORIES data
const resolveCategoryMap: Record<string, string> = {};
for (const cat of TANTRA_CATEGORIES) {
  for (const alias of cat.siddhiAlias) {
    resolveCategoryMap[alias.toLowerCase()] = cat.id;
  }
}

const pageProps: ArchivePageProps = {
  siddhis: allSiddhis,
  siddhiCount: SIDDHI_COUNT,
  mahaVidyas: TEN_MAHAVIDYAS,
  resolveCategoryMap,
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
