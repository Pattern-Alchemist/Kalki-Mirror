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

export const TIER_COLORS_LIGHT: Record<Tier, string> = {
  prithvi: '#d4a853',
  jal: '#7ec8e3',
  agni: '#e8734f',
  akash: '#a99de0',
};

/** Tailwind badge classes for tier gates — single source of truth */
export const TIER_BADGE_STYLES: Record<Tier, string> = {
  prithvi: 'bg-[#8a7230]/15 text-[#d4a853] border-[#8a7230]/30',
  jal: 'bg-[#4a8fa8]/15 text-[#7ec8e3] border-[#4a8fa8]/30',
  agni: 'bg-[#c44b2b]/15 text-[#e8734f] border-[#c44b2b]/30',
  akash: 'bg-[#7c6bb5]/15 text-[#a99de0] border-[#7c6bb5]/30',
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
