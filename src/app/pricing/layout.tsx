import type { Metadata } from 'next';

import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';

export const metadata: Metadata = {
  alternates: pageAlternates('/pricing'),
  title: 'Four Paths, One Purpose',
  description:
    'Four membership tiers — Prithvi, Jal, Agni, and Akash. Each unlocks deeper layers of the Akashic Archive, consultations, and live satsang.',
  openGraph: {
    url: canonicalUrl('/pricing'),
    title: 'Four Paths, One Purpose | KALKI',
    description:
      'Four membership tiers — Prithvi, Jal, Agni, and Akash. Each unlocks deeper layers of the Akashic Archive, consultations, and live satsang.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/pricing/fire-ritual-yantra-hero',
        width: 1200,
        height: 630,
        alt: 'Membership Tiers — KALKI',
      },
    ],
  },
};

/* Vol. 4 #10 — the layout's old hand-written graph is GONE: it carried a
 * catalog of membership offers with prices 10× the real tiers (Jal 4999
 * vs ₹499, Agni 14999 vs ₹1,499, Akash 49990 vs ₹4,999) and an FAQ set
 * the page never renders. Structured data on this route is now GENERATED
 * from the modules the page renders:
 *   · tier offers → buildMembershipServiceJsonLd() on the page (pricing.ts)
 *   · FAQ answers → buildFaqPageJsonLd(FAQ_DATA) on the page (faq-data.ts)
 * The layout keeps only the two price-free nodes below — the truth test
 * pins that no offer or FAQ graph ever returns here. */

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'KALKI Membership Tiers',
      description: 'Four membership tiers with progressive access to the Akashic Archive, consultations, and live satsang.',
      url: `${SITE_URL}/pricing`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Membership', item: `${SITE_URL}/pricing` },
      ],
    },
  ],
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingJsonLd) }}
      />
      {children}
    </>
  );
}
