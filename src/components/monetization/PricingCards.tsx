'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { pricingTiers } from '@/lib/data/pricing';
import type { PricingTier } from '@/lib/data/types';

function TierCard({ tier, reduced }: { tier: PricingTier; reduced: boolean }) {
  const highlighted = tier.highlight;

  return (
    <motion.div
      variants={reduced ? undefined : staggerItem}
      className={cn(
        'bg-surface p-6 flex flex-col gap-4 border transition-colors',
        highlighted
          ? 'border-[var(--gold)] shadow-[0_0_40px_rgba(201,168,76,0.08)]'
          : 'border-border-subtle',
      )}
    >
      <div>
        <h3 className="font-display text-xl text-gold">{tier.id === 'prithvi' ? 'Prithvi' : tier.id === 'jal' ? 'Jal' : tier.id === 'agni' ? 'Agni' : 'Akash'}</h3>
        <p className="text-xs text-text-muted mt-0.5">{tier.elementSanskrit}</p>
      </div>

      <p className="font-ui text-2xl text-foreground">
        ₹{tier.priceINR.toLocaleString('en-IN')}
        <span className="text-sm text-text-muted ml-1">/mo</span>
      </p>
      {tier.annualDiscount && (
        <p className="text-xs text-text-secondary">Save {tier.annualDiscount} annually</p>
      )}

      <ul className="space-y-2 flex-1">
        {tier.unlocks.map((f) => (
          <li key={f} className="text-xs text-text-secondary font-ui">{f}</li>
        ))}
      </ul>

      <Link
        href="/pricing"
        className={cn(
          'mt-auto text-center text-sm font-ui py-2.5 px-4 transition-all',
          highlighted
            ? 'gold-cta'
            : 'ghost-cta',
        )}
      >
        {highlighted ? 'Choose Agni' : 'Select Plan'}
      </Link>
    </motion.div>
  );
}

export function PricingCards({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6', className)}
      variants={prefersReduced ? undefined : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {pricingTiers.map((tier) => (
        <TierCard key={tier.id} tier={tier} reduced={prefersReduced} />
      ))}
    </motion.div>
  );
}
