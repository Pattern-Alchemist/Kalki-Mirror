'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useTier } from '@/components/layout/TierProvider';
import { Tier } from '@/lib/data/types';
import { pricingTiers, formatPrice } from '@/lib/data/pricing';

interface GatedContentProps {
  minTier: Tier;
  children: React.ReactNode;
  label?: string;
  teaser?: string;
}

const overlayVariants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' as const } },
};

export function GatedContent({ minTier, children, label, teaser }: GatedContentProps) {
  const { canAccess, tier: currentTier, currency, requestUpgrade } = useTier();
  const reduced = useReducedMotion();
  const allowed = canAccess(minTier);

  const tier = pricingTiers.find((t) => t.id === minTier);
  const displayTitle = label ?? 'Premium Content';
  const displayTeaser = teaser ?? `This practice is available to ${tier?.element ?? minTier} practitioners and above.`;
  const price = formatPrice(currency === 'INR' ? (tier?.priceINR ?? 0) : (tier?.priceUSD ?? 0), currency);

  const handleUnlock = () => requestUpgrade(displayTitle, minTier);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {allowed ? (
          <motion.div key="unlocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Blurred preview */}
            <div className="blur-sm opacity-20 pointer-events-none select-none overflow-hidden" aria-hidden="true">{children}</div>

            {/* Glass overlay with lock card */}
            <AnimatePresence>
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute inset-0 z-10 flex items-center justify-center"
              >
                <div className="glass-chip max-w-md w-full mx-4 p-8 flex flex-col items-center text-center gap-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-dim" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <h3 className="font-display text-xl text-foreground">{displayTitle}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-sm">{displayTeaser}</p>
                  <button onClick={handleUnlock} className="gold-cta mt-2 text-xs" aria-label={`Unlock ${displayTitle}`}>
                    Unlock — {tier?.element ?? minTier}
                  </button>
                  <p className="text-text-muted text-xs">
                    Starting at <span className="text-gold-dim font-semibold">{price}</span>/ month
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}