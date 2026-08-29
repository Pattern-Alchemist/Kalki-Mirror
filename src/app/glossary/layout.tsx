import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { glossaryEntries } from '@/lib/data/glossary';
import { CANONICAL } from '@/lib/canonical';

const GLOSSARY_DESC = `${CANONICAL.lexiconTerms} Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās — the vocabulary of consciousness transformation.`;

export const metadata: Metadata = {
  alternates: pageAlternates('/glossary'),
  title: 'The Lexicon',
  description: GLOSSARY_DESC,
  openGraph: {
    url: canonicalUrl('/glossary'),
    title: 'The Lexicon | KALKI',
    description: GLOSSARY_DESC,
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/codex/sanskrit-plate-hero',
        width: 1200,
        height: 630,
        alt: 'The Lexicon — KALKI',
      },
    ],
  },
};

const glossaryJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'The Lexicon',
      description: `${CANONICAL.lexiconTerms} Sanskrit and Tantric terms defined in the KALKI framework. From Oṃ to Kuṇḍalinī, from Prāṇāyāma to the Mahāvidyās.`,
      url: `${SITE_URL}/glossary`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      // GEO kit fix #5 — DefinedTermSet for the Lexicon's terms.
      // Gives generative engines an addressable definition for every
      // Sanskrit term KALKI is authoritative on.
      '@type': 'DefinedTermSet',
      '@id': `${SITE_URL}/glossary#termset`,
      name: 'The KALKI Lexicon',
      description: `${CANONICAL.lexiconTerms} Sanskrit and Tantric terms defined in the KALKI framework.`,
      url: `${SITE_URL}/glossary`,
      hasDefinedTerm: glossaryEntries.map((entry) => ({
        '@type': 'DefinedTerm',
        name: entry.term,
        alternateName: entry.sanskrit,
        description: entry.definition,
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

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryJsonLd) }}
      />
      {children}
    </>
  );
}
