/**
 * Tier → Caution access mapping.
 *
 * Pool P (prescription): always OPEN only.
 * Pool C (citation): filtered by the user's tier.
 */

import type { Tier, SiddhiLevel } from '@/lib/data/types';

export type CautionLevel = 'OPEN' | 'MODERATE' | 'HIGH' | 'SEALED';

export const TIER_TO_CAUTION: Record<Tier, CautionLevel[]> = {
  prithvi: ['OPEN'],
  jal:     ['OPEN', 'MODERATE'],
  agni:    ['OPEN', 'MODERATE', 'HIGH'],
  akash:   ['OPEN', 'MODERATE', 'HIGH', 'SEALED'],
};

export const PRESCRIPTION_CAUTIONS: CautionLevel[] = ['OPEN'];

export function siddhiLevelToCaution(level: SiddhiLevel): CautionLevel {
  switch (level) {
    case 'Foundation':  return 'OPEN';
    case 'Intermediate': return 'MODERATE';
    case 'Advanced':    return 'HIGH';
    case 'Restricted':  return 'SEALED';
  }
}
