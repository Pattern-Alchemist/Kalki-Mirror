import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
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

// NOTE (Vol. 3 #4): the DefinedTermSet JSON-LD graph used to live here —
// but a layout renders for BOTH the hub and all 86 term pages, duplicating
// an 86-term graph onto every term page. The graph moved to the hub's own
// page.tsx; term pages carry their single DefinedTerm (glossary-seo.ts)
// which still references the `${SITE_URL}/glossary#termset` @id.
export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
