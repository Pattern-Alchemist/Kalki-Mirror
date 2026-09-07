import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { pricingTiers } from '@/lib/data/pricing';
import { buildMembershipServiceJsonLd } from '@/lib/seo/service-schema';
import { buildFaqPageJsonLd } from '@/lib/seo/faq-schema';
import { FAQ_DATA } from './faq-data';

export const metadata: Metadata = {
  title: 'The Covenant — Four Tiers',
  description: 'Four access levels. One path to Shambhala. Prithvi, Jal, Agni, Akash — each tier unlocks deeper layers of the Akashic Archive.',
};

/* Vol. 2 #20 — Service + Offer graph for the four membership tiers
 * (Prithvi free → Akash ₹4,999, INR, monthly unit pricing). Server-
 * rendered so the price graph ships in the initial HTML.
 * Vol. 4 #10 — the FAQPage graph is GENERATED from FAQ_DATA (the same
 * items the page renders), replacing the layout's old hand-written
 * graph whose prices were 10× the real tiers. */
const serviceJsonLd = buildMembershipServiceJsonLd();
const faqJsonLd = buildFaqPageJsonLd(FAQ_DATA, {
  path: '/pricing',
  name: 'KALKI Membership — Frequently Asked Questions',
});

const PricingPageClient = dynamic(
  () => import('./PricingPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">SACRED OFFERINGS</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            The Covenant
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            Four access levels. One path to Shambhala.&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PricingPageClient pricingTiers={pricingTiers} />
    </>
  );
}
