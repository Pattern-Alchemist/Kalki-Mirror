import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { pricingTiers } from '@/lib/data/pricing';

export const metadata: Metadata = {
  title: 'The Covenant — Four Tiers',
  description: 'Four access levels. One path to Shambhala. Prithvi, Jal, Agni, Akash — each tier unlocks deeper layers of the Akashic Archive.',
};

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
  return <PricingPageClient pricingTiers={pricingTiers} />;
}
