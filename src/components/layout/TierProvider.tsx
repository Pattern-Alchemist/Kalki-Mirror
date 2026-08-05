'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Tier } from '@/lib/data/types';
import { detectCurrency, formatPrice, pricingTiers } from '@/lib/data/pricing';
import type { Currency } from '@/lib/data/pricing';

const TIER_ORDER: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];

export interface TierContextValue {
  tier: Tier;
  setTier: (t: Tier) => void;
  canAccess: (required: Tier) => boolean;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  showPaywall: boolean;
  setShowPaywall: (v: boolean) => void;
  paywallFeature: string;
  requestUpgrade: (feature: string, requiredTier: Tier) => boolean;
}

const TierContext = createContext<TierContextValue>({
  tier: 'prithvi',
  setTier: () => {},
  canAccess: () => false,
  currency: 'INR',
  setCurrency: () => {},
  showPaywall: false,
  setShowPaywall: () => {},
  paywallFeature: '',
  requestUpgrade: () => false,
});

function getSavedTier(): Tier {
  try {
    const saved = localStorage.getItem('astrokalki-tier') as Tier | null;
    const valid: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];
    if (saved && valid.includes(saved)) return saved;
  } catch { /* SSR */ }
  return 'prithvi';
}

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>(getSavedTier);
  const [currency, setCurrency] = useState<Currency>(detectCurrency);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  const canAccess = useCallback(
    (required: Tier) => TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(required),
    [tier]
  );

  const requestUpgrade = useCallback(
    (feature: string, requiredTier: Tier): boolean => {
      if (!canAccess(requiredTier)) {
        setPaywallFeature(feature);
        setShowPaywall(true);
        return false;
      }
      return true;
    },
    [canAccess],
  );

  const upgrade = useCallback((newTier: Tier) => {
    setTier(newTier);
    setShowPaywall(false);
    setPaywallFeature('');
    try { localStorage.setItem('astrokalki-tier', newTier); } catch { /* */ }
  }, []);

  return (
    <TierContext.Provider value={{ tier, setTier, canAccess, currency, setCurrency, showPaywall, setShowPaywall, paywallFeature, requestUpgrade }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  return useContext(TierContext);
}
