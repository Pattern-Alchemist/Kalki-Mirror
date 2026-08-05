import { Tier } from '@/lib/data/types';

export const TIER_ORDER: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];

export const TIER_LABELS: Record<Tier, string> = {
  prithvi: 'Prithvi',
  jal: 'Jal',
  agni: 'Agni',
  akash: 'Akash',
};

export const TIER_ELEMENTS: Record<Tier, string> = {
  prithvi: 'Earth',
  jal: 'Water',
  agni: 'Fire',
  akash: 'Sky',
};

export const TIER_COLORS: Record<Tier, string> = {
  prithvi: '#8a7230',
  jal: '#4a8fa8',
  agni: '#c44b2b',
  akash: '#7c6bb5',
};

export function tierIndex(tier: Tier): number {
  return TIER_ORDER.indexOf(tier);
}

export function canAccess(userTier: Tier, requiredTier: Tier): boolean {
  return tierIndex(userTier) >= tierIndex(requiredTier);
}

export function getTierCTA(requiredTier: Tier): string {
  if (requiredTier === 'jal') return 'Unlock with Jal';
  if (requiredTier === 'agni') return 'Unlock with Agni';
  if (requiredTier === 'akash') return 'Unlock with Akash';
  return '';
}
