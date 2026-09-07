// =============================================================
// KALKI — FAQPage JSON-LD BUILDER (Vol. 4 #10)
// -------------------------------------------------------------
// /pricing used to ship a HAND-WRITTEN FAQPage in its layout whose
// answers contradicted the FAQ the page actually renders — and an
// OfferCatalog whose prices were 10× the real tiers. Structured
// data must be GENERATED from the same modules the page renders,
// never transcribed by hand. This builder takes the items a page
// really displays and produces the FAQPage graph.
//
// Pure function (no React, no DB) so the page and the
// structured-data truth test share one truth.
// =============================================================

import { SITE_URL } from '@/lib/utils/metadata';

export interface FaqGraphItem {
  question: string;
  answer: string;
}

export function buildFaqPageJsonLd(
  items: FaqGraphItem[],
  opts: { path: string; name?: string }
) {
  const url = `${SITE_URL}${opts.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    ...(opts.name ? { name: opts.name } : {}),
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
