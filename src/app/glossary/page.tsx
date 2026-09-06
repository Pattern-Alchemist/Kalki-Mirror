import type { Metadata } from 'next';
import { glossaryEntries, CATEGORIES } from '@/lib/data/glossary';
import dynamic from 'next/dynamic';
import type { GlossaryEntry } from '@/lib/data/glossary';
import { SITE_URL } from '@/lib/utils/metadata';
import { glossaryTermPath } from '@/lib/seo/glossary-seo';

export const metadata: Metadata = {
  title: `The Lexicon — ${glossaryEntries.length} Tantric Terms`,
  description: `${glossaryEntries.length} Sanskrit & Tantric terms decoded in the KALKI framework. A cartographic instrument — each term is a coordinate in the map of tantrik psychology.`,
};

// DefinedTermSet graph — lives on the HUB ONLY (moved out of layout.tsx in
// Vol. 3 #4 so the 86-term graph stops duplicating onto every term page;
// term pages reference this @id from their own DefinedTerm nodes).
const glossaryJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'The Lexicon',
      description: `${glossaryEntries.length} Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās.`,
      url: `${SITE_URL}/glossary`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      // GEO kit fix #5 — DefinedTermSet for the Lexicon's terms, now with
      // per-term `url` pointing at the programmatic term pages.
      '@type': 'DefinedTermSet',
      '@id': `${SITE_URL}/glossary#termset`,
      name: 'The KALKI Lexicon',
      description: `${glossaryEntries.length} Sanskrit and Tantric terms defined in the KALKI framework.`,
      url: `${SITE_URL}/glossary`,
      hasDefinedTerm: glossaryEntries.map((entry) => ({
        '@type': 'DefinedTerm',
        name: entry.term,
        alternateName: entry.sanskrit,
        description: entry.definition,
        url: `${SITE_URL}${glossaryTermPath(entry.term)}`,
        inDefinedTermSet: { '@id': `${SITE_URL}/glossary#termset` },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'The Lexicon', item: `${SITE_URL}/glossary` },
      ],
    },
  ],
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
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryJsonLd) }}
      />
      <GlossaryPageClient entries={glossaryEntries} categories={CATEGORIES} />
    </>
  );
}
