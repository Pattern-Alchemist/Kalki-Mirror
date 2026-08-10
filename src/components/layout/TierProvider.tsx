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
  refreshTier: () => void;
  upgrade: (newTier: Tier) => void;
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
  refreshTier: () => {},
  upgrade: () => {},
});

/**
 * Fetches the authenticated user's real tier from the DB.
 * This is the SOLE source of truth — always fresh, not from a stale JWT.
 * Falls back to null if unauthenticated.
 */
async function fetchServerTier(): Promise<Tier | null> {
  try {
    const res = await fetch('/api/user/tier');
    if (!res.ok) return null;
    const data = await res.json();
    const valid: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];
    const t = data?.tier;
    if (t && valid.includes(t)) return t;
  } catch {
    // Fetch failed — remain at default tier
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

  /**
   * Re-fetches tier from the server (DB). Call after key redemption
   * or any event that may have changed the tier server-side.
   */
  const refreshTier = useCallback(() => {
    fetchServerTier().then((serverTier) => {
      if (serverTier) setTier(serverTier);
    });
  }, []);

  const upgrade = useCallback((newTier: Tier) => {
    // Immediately update client, then verify with server
    setTier(newTier);
    setShowPaywall(false);
    setPaywallFeature('');
    // Verify with the DB after a short delay (allows redeem to commit)
    setTimeout(() => refreshTier(), 500);
  }, [refreshTier]);

  return (
    <TierContext.Provider value={{ tier, setTier, upgrade, canAccess, currency, setCurrency, showPaywall, setShowPaywall, paywallFeature, requestUpgrade, refreshTier }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  return useContext(TierContext);
}

export type { TierContextValue };
