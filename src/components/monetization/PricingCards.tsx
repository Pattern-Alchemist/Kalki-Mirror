'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import { pricingTiers } from '@/lib/data/pricing';
import type { PricingTier } from '@/lib/data/types';

const ACCESS_LABELS: Record<string, string> = {
  prithvi: 'The Antechamber',
  jal: 'The Initiate',
  agni: 'The Practitioner',
  akash: 'The Sovereign',
};

function TierRow({ tier, index, reduced }: { tier: PricingTier; index: number; reduced: boolean }) {
  const isPaid = (tier.priceINR ?? 0) > 0;
  const highlighted = tier.highlight;

  return (
    <motion.div
      variants={reduced ? undefined : staggerItem}
      className="group relative flex flex-col md:flex-row md:items-stretch gap-0"
    >
      <div className="flex items-center gap-4 md:w-64 shrink-0 p-6 md:p-8 border-b md:border-b-0 md:border-r border-gold/5">
        <div className="hidden md:flex flex-col items-center gap-1">
          <div className="w-px h-4" style={{ backgroundColor: 'var(--copper)', opacity: 0.3 }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: highlighted ? 'var(--gold)' : 'var(--copper)' }} />
          <div className="w-px h-4" style={{ backgroundColor: 'var(--copper)', opacity: 0.3 }} />
        </div>
        <div>
          <h3 className="font-display text-xl text-foreground font-light tracking-wide group-hover:text-gold transition-colors duration-500">
            {ACCESS_LABELS[tier.id] ?? tier.element}
          </h3>
          <p className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-copper mt-1">
            {tier.elementSanskrit} {'\u00B7'} {tier.element}
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 md:p-8">
        <ul className="space-y-2.5">
          {(tier.features ?? tier.unlocks).map((f, fi) => (
            <li key={fi} className="flex items-start gap-3">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-gold/40 shrink-0" />
              <span className="text-text-secondary text-sm leading-relaxed">{f}</span>
            </li>
          ))}
          {(tier.gatedFeatures ?? []).map((f, gi) => (
            <li key={`g-${gi}`} className="flex items-start gap-3 opacity-30">
              <span className="mt-1.5 w-1 h-1 rounded-full border border-copper/40 shrink-0" />
              <span className="text-text-muted text-sm leading-relaxed line-through">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-center justify-center p-6 md:p-8 md:w-56 shrink-0 border-t md:border-t-0 md:border-l border-gold/5">
        <div className="text-center mb-4">
          {isPaid ? (
            <>
              <p className="font-display text-3xl text-foreground font-light">{'\u20B9'}{tier.priceINR.toLocaleString('en-IN')}</p>
              <p className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-text-muted mt-1">/month</p>
            </>
          ) : (
            <p className="font-display text-2xl text-text-muted font-light">Free</p>
          )}
        </div>
        <Link
          href="/pricing"
          className={cn(
            'w-full text-center text-xs font-ui py-3 px-4 tracking-[0.12em] uppercase transition-all',
            highlighted ? 'gold-cta' : 'ghost-cta',
          )}
        >
          {tier.cta ?? 'Enter'}
        </Link>
      </div>
    </motion.div>
  );
}

export function PricingCards({ className }: { className?: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className={cn('max-w-5xl mx-auto', className)}
      variants={prefersReduced ? undefined : staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      <div className="border border-gold/5 divide-y divide-gold/5">
        {pricingTiers.map((tier, i) => (
          <TierRow key={tier.id} tier={tier} index={i} reduced={prefersReduced} />
        ))}
      </div>
    </motion.div>
  );
}
