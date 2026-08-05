'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useTier } from '@/components/layout/TierProvider';
import { pricingTiers, formatPrice } from '@/lib/data/pricing';
import { TIER_ORDER, TIER_LABELS } from '@/lib/utils/tier-gate';
import type { Tier } from '@/lib/data/types';

const WHATSAPP_NUMBER = '918920862931';

export function PaywallModal() {
  const { tier: currentTier } = useTier();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  const nextTierIdx = TIER_ORDER.indexOf(currentTier) + 1;
  const nextTier = nextTierIdx < TIER_ORDER.length ? TIER_ORDER[nextTierIdx] : null;
  const nextTierData = nextTier ? pricingTiers.find((t) => t.id === nextTier) : null;

  const handleUpgrade = useCallback(() => {
    if (!nextTierData) return;
    const priceStr = formatPrice(nextTierData.priceINR ?? 0, 'INR');
    const msg = `I would like to upgrade to ${nextTierData.element} (${priceStr}/mo).`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  }, [nextTierData]);

  // Only show for users viewing gated content who are on prithvi or jal
  const shouldShow = currentTier === 'prithvi' || currentTier === 'jal';
  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Modal */}
          <motion.div
            className="relative glass-chip p-8 max-w-md w-full z-10"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-2xl text-foreground mb-2">Deeper Access Required</h2>
            <p className="text-text-secondary text-sm mb-6">
              This content is available on the <span className="text-gold">{nextTier ? TIER_LABELS[nextTier] : 'next'}</span> tier and above.
            </p>
            {nextTierData && (
              <div className="mb-6">
                <p className="text-text-muted text-xs mb-1">Starting at</p>
                <p className="font-display text-3xl text-gold">{formatPrice(nextTierData.priceINR ?? 0, 'INR')}<span className="text-text-muted text-sm">/mo</span></p>
                <p className="text-text-secondary text-xs mt-2">3-day free trial included</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={handleUpgrade} className="gold-cta flex-1 text-sm">Upgrade via WhatsApp</button>
              <button onClick={() => setOpen(false)} className="ghost-cta flex-1 text-sm">Not Now</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
