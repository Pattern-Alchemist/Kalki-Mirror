import type { Metadata } from 'next';
import { TEN_MAHAVIDYAS, ALL_ARCHETYPES } from '@/lib/data/archetypes';
import { allSiddhis } from '@/lib/data/siddhis';
import dynamic from 'next/dynamic';
import type { ArchetypesPageProps } from './ArchetypesPageClient';

export const metadata: Metadata = {
  title: 'Archetypes — Ten Mahāvidyās',
  description: 'The ten Mahāvidyās as diagnostic archetypes — each governing a specific karmic loop. Kali, Tara, Bhuvaneshwari, and the architecture of consciousness.',
};

// Pre-compute siddhi lookup so client doesn't need the full siddhis array
const siddhiLookup: Record<string, { name: string; tradition: string; level: string }> = {};
for (const s of allSiddhis) {
  siddhiLookup[s.slug] = { name: s.name, tradition: s.tradition, level: s.level };
}

const pageProps: ArchetypesPageProps = {
  tenMahavidyas: TEN_MAHAVIDYAS,
  allArchetypes: ALL_ARCHETYPES,
  siddhiLookup,
};

const ArchetypesPageClient = dynamic(
  () => import('./ArchetypesPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-center justify-center text-center px-6">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-6">THE WHEEL OF BECOMING</p>
          <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 hero-heading uppercase">
            Ten Mahāvidyās
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Ten faces of the divine feminine — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function ArchetypesPage() {
  return <ArchetypesPageClient {...pageProps} />;
}
