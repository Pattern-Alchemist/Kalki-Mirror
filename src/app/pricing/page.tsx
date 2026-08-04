'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { pricingTiers } from '@/lib/data/pricing';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

export default function PricingPage() {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const reduced = useReducedMotion();

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/tantra/bhairava-pathway.jpeg"
        title="Choose Your Depth"
        subtitle="Four paths. One purpose. Every tier unlocks a deeper layer."
        sectionLabel="Membership"
      />

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Currency toggle */}
        <div className="flex justify-center mb-16">
          <div className="glass-chip p-1 flex gap-1">
            <button
              onClick={() => setCurrency('INR')}
              className={`px-6 py-2 text-xs font-ui tracking-wider uppercase rounded transition-all ${
                currency === 'INR' ? 'bg-gold text-deep-black' : 'text-text-muted hover:text-gold'
              }`}
            >
              INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-6 py-2 text-xs font-ui tracking-wider uppercase rounded transition-all ${
                currency === 'USD' ? 'bg-gold text-deep-black' : 'text-text-muted hover:text-gold'
              }`}
            >
              USD
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {pricingTiers.map((tier) => {
            const price = currency === 'INR'
              ? `₹${tier.priceINR.toLocaleString()}`
              : `$${tier.priceUSD}`;
            const period = currency === 'INR' ? '/mo' : '/mo';

            return (
              <motion.div
                key={tier.id}
                variants={staggerItem}
                className={`relative bg-surface rounded-lg p-6 border transition-all ${
                  tier.highlight
                    ? 'border-gold shadow-lg shadow-gold/10'
                    : 'border-gold-subtle hover:border-gold-dim'
                }`}
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-deep-black text-xs font-ui tracking-wider uppercase px-4 py-1">
                    Most Popular
                  </span>
                )}

                <p className="section-label mb-1">{tier.element}</p>
                <h3 className="font-display text-2xl mb-1">{TIER_LABELS[tier.id]}</h3>
                <p className="text-text-muted text-xs mb-4">{tier.elementSanskrit}</p>

                <div className="mb-6">
                  <span className="font-display text-3xl text-gold">{price}</span>
                  <span className="text-text-muted text-sm">{period}</span>
                  <p className="text-text-muted text-xs mt-1">{tier.annualDiscount} annual discount</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.unlocks.map((u, i) => (
                    <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                      <span className="text-gold mt-0.5">·</span>{u}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 text-sm font-ui tracking-wider uppercase rounded transition-all ${
                    tier.id === 'prithvi'
                      ? 'ghost-cta'
                      : 'gold-cta'
                  }`}
                >
                  {tier.id === 'prithvi' ? 'Current Plan' : `Choose ${TIER_LABELS[tier.id]}`}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}