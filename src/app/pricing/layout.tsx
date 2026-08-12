import type { Metadata } from 'next';

const SITE_URL = 'https://astrokalki.com';

export const metadata: Metadata = {
  title: 'Four Paths, One Purpose',
  description:
    'Four membership tiers — Seeker, Adept, Initiate, and Sovereign. Each unlocks deeper layers of the Akashic Archive, consultations, and live satsang.',
  openGraph: {
    title: 'Four Paths, One Purpose | KALKI',
    description:
      'Four membership tiers — Seeker, Adept, Initiate, and Sovereign. Each unlocks deeper layers of the Akashic Archive, consultations, and live satsang.',
    images: [
      {
        url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/tantra/hero-labyrinth-alt',
        width: 1200,
        height: 630,
        alt: 'Membership Tiers — KALKI',
      },
    ],
  },
};

const pricingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'KALKI Membership Tiers',
  description: 'Four membership tiers with progressive access to the Akashic Archive, consultations, and live satsang.',
  url: `${SITE_URL}/pricing`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'KALKI Membership',
    itemListElement: [
      {
        '@type': 'Offer',
        name: 'Prithvi',
        description: 'Free tier — Seeker level access to foundational content.',
        price: '0',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        name: 'Jal',
        description: 'Adept tier — full archive access and intermediate siddhis.',
        price: '4999',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        name: 'Agni',
        description: 'Initiate tier — advanced siddhis, consultations, and satsang.',
        price: '14999',
        priceCurrency: 'INR',
      },
      {
        '@type': 'Offer',
        name: 'Akash',
        description: 'Sovereign tier — unrestricted access, priority consultations, and personal guidance.',
        price: '49990',
        priceCurrency: 'INR',
      },
    ],
  },
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
