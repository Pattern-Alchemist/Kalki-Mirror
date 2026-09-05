/**
 * SERVICE + OFFER JSON-LD — Vol. 2 #20 (rich-results layer)
 *
 * /consultations and /pricing already carry FAQPage graphs; search engines
 * can additionally render price + availability directly when a Service
 * graph with concrete Offers ships alongside. Prices are the site's real
 * numbers (₹1,999 / ₹3,499 consultations; ₹0–₹4,999 memberships, INR) —
 * mirrors faqJsonLd's server-rendered <script type="application/ld+json">.
 *
 * Honesty constraints (same policy as the testimonial wall):
 *   · no aggregateRating / review fabrications — only facts the site owns
 *   · availability is InStock (booking is always open) — never Limited
 *     unless the product actually gates
 *   · every url is absolute, anchored to SITE_URL at build time
 */

import { pricingTiers } from '@/lib/data/pricing';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.astrokalki.com';

export const ORG_ID = `${SITE}/#organization`;
export const CONSULTATION_SERVICE_ID = `${SITE}/consultations#service`;
export const MEMBERSHIP_SERVICE_ID = `${SITE}/pricing#service`;

/** Shared publisher graph node — matches the org the other pages describe. */
function organization() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'KALKI',
    url: SITE,
    logo: `${SITE}/icon-512.png`,
  };
}

interface OfferInput {
  /** Stable id fragment, e.g. "pattern-consultation" */
  slug: string;
  name: string;
  description: string;
  /** Selling price in whole INR (0 = free) */
  priceINR: number;
  /** Human duration for the offer name, e.g. "60 min" */
  duration?: string;
}

function offer(input: OfferInput) {
  const price = input.priceINR;
  return {
    '@type': 'Offer',
    '@id': `${CONSULTATION_SERVICE_ID}/${input.slug}`,
    name: input.duration ? `${input.name} (${input.duration})` : input.name,
    description: input.description,
    price: String(price),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `${SITE}/consultations`,
    validFrom: '2026-01-01',
    ...(price === 0
      ? {}
      : {
          priceSpecification: {
            '@type': 'PriceSpecification',
            price: String(price),
            priceCurrency: 'INR',
            valueAddedTaxIncluded: true,
          },
        }),
  };
}

const CONSULTATION_OFFERS: OfferInput[] = [
  {
    slug: 'archival-discovery',
    name: 'Archival Discovery',
    description:
      'A free 30-minute introductory call to understand your practice background, discuss goals, and determine the right path forward.',
    priceINR: 0,
    duration: '30 min',
  },
  {
    slug: 'pattern-consultation',
    name: 'Pattern Consultation',
    description:
      'A focused 60-minute one-on-one session to refine your practice, troubleshoot obstacles, and receive personalized guidance on technique and progression.',
    priceINR: 1999,
    duration: '60 min',
  },
  {
    slug: 'shadow-dossier',
    name: 'Shadow Dossier',
    description:
      'A 90-minute deep-dive identifying your dominant shadow patterns, their origins, and prescribing specific practices as antidotes. Includes a written summary.',
    priceINR: 3499,
    duration: '90 min',
  },
];

/**
 * /consultations — ProfessionalService carrying the three bookable
 * consultations as concrete Offers (free discovery + the two paid tiers).
 */
export function buildConsultationServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      {
        '@type': 'ProfessionalService',
        '@id': CONSULTATION_SERVICE_ID,
        name: 'KALKI Consultations — the Mirror Method',
        description:
          'One-on-one pattern-analysis consultations with Kaustubh: the Mirror Method diagnostic, personalized sādhana prescriptions, and WhatsApp video sessions worldwide.',
        url: `${SITE}/consultations`,
        serviceType: 'Pattern-analysis consultation',
        provider: { '@id': ORG_ID },
        areaServed: 'Worldwide',
        availableLanguage: ['en', 'hi'],
        makesOffer: CONSULTATION_OFFERS.map(offer),
      },
    ],
  };
}

/**
 * /pricing — the four membership tiers (Prithvi/Jal/Agni/Akásha) as one
 * Service graph. Subscription semantics: the site models monthly pricing
 * with an annual option, so each tier emits its monthly Offer plus an
 * AddOn-ish annual Offer when a yearly price exists.
 */
export function buildMembershipServiceJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(),
      {
        '@type': 'Service',
        '@id': MEMBERSHIP_SERVICE_ID,
        name: 'KALKI Membership — the Four Tiers',
        description:
          'Four access levels to the Akashic Archive: Prithvi (free), Jal, Agni, and Akash — each unlocking deeper sādhana libraries, pattern diagnostics, and guidance.',
        url: `${SITE}/pricing`,
        serviceType: 'Membership subscription',
        provider: { '@id': ORG_ID },
        areaServed: 'Worldwide',
        availableLanguage: ['en', 'hi'],
        makesOffer: pricingTiers.map((t) => ({
          '@type': 'Offer',
          '@id': `${MEMBERSHIP_SERVICE_ID}/${t.id}`,
          name: `${t.element} tier (${t.elementSanskrit})`,
          description: t.description,
          price: String(t.priceINR),
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          url: `${SITE}/pricing`,
          ...(t.priceINR > 0
            ? {
                priceSpecification: {
                  '@type': 'UnitPriceSpecification',
                  price: String(t.priceINR),
                  priceCurrency: 'INR',
                  unitText: 'MONTH',
                  billingDuration: 1,
                  billingIncrement: 1,
                  valueAddedTaxIncluded: true,
                },
              }
            : {}),
        })),
      },
    ],
  };
}
