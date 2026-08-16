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

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'KALKI Membership Tiers',
      description: 'Four membership tiers with progressive access to the Akashic Archive, consultations, and live satsang.',
      url: `${SITE_URL}/pricing`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'KALKI Membership',
        itemListElement: [
          { '@type': 'Offer', name: 'Prithvi', description: 'Free tier — Seeker level access to foundational content.', price: '0', priceCurrency: 'INR' },
          { '@type': 'Offer', name: 'Jal', description: 'Adept tier — full archive access and intermediate siddhis.', price: '4999', priceCurrency: 'INR' },
          { '@type': 'Offer', name: 'Agni', description: 'Initiate tier — advanced siddhis, consultations, and satsang.', price: '14999', priceCurrency: 'INR' },
          { '@type': 'Offer', name: 'Akash', description: 'Sovereign tier — unrestricted access, priority consultations, and personal guidance.', price: '49990', priceCurrency: 'INR' },
        ],
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
        { '@type': 'ListItem', position: 2, name: 'Membership', item: `${SITE_URL}/pricing` },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is included in the free Prithvi tier?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Prithvi gives you free access to foundational siddhis (Foundation level), the Mirror Method diagnostic, pattern identification, and the public archive. No payment or credit card required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do Golden Keys work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Jal tier members and above receive 3 Golden Keys. Each key grants one person access to your tier level for 30 days. Share them with practitioners who would benefit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I upgrade or downgrade my tier?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. You can upgrade at any time through the pricing page. The new tier activates immediately. Downgrades take effect at the next billing cycle.',
          },
        },
        {
          '@type': 'Question',
          name: 'What payment methods are accepted?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We accept UPI, credit cards, debit cards, and net banking through our secure Razorpay integration. All prices are in Indian Rupees (INR).',
          },
        },
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
