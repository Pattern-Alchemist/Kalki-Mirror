'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Tier } from '@/lib/data/types';

interface TierContextValue {
  tier: Tier;
  setTier: (t: Tier) => void;
  canAccess: (required: Tier) => boolean;
}

const TierContext = createContext<TierContextValue>({
  tier: 'prithvi',
  setTier: () => {},
  canAccess: () => false,
});

const TIER_ORDER: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];

export function TierProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<Tier>('prithvi');
  const canAccess = useCallback(
    (required: Tier) => TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(required),
    [tier]
  );
  return (
    <TierContext.Provider value={{ tier, setTier, canAccess }}>
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  return useContext(TierContext);
}