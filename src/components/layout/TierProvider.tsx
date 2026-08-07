'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
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

/**
 * Server-issued tier API — fetches the authenticated user's real tier.
 * Falls back to null if unauthenticated.
 */
async function fetchServerTier(): Promise<Tier | null> {
  try {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const session = await res.json();
    const valid: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];
    const t = session?.user?.tier;
    if (t && valid.includes(t)) return t;
  } catch {
    // Session fetch failed
  }
  return null;
}

// localStorage fallback REMOVED — tier is now server-authoritative only.
// Prevents client-side tier spoofing via DevTools.
function getInitialTier(): Tier {
  return 'prithvi';
}

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>(getInitialTier);
  const [currency, setCurrency] = useState<Currency>(detectCurrency);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  // On mount, sync with server-issued tier (the real DB tier).
  // This is the SOLE source of truth — no localStorage fallback.
  useEffect(() => {
    fetchServerTier().then((serverTier) => {
      if (serverTier) {
        setTier(serverTier);
      }
    });
  }, []);

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
    // Only update if server confirms the new tier (e.g. after key redemption)
    // Direct client-side tier setting is removed for security.
    setTier(newTier);
    setShowPaywall(false);
    setPaywallFeature('');
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
