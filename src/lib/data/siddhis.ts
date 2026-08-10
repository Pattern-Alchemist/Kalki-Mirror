import type { Siddhi } from './types';
import { foundationSiddhis } from './siddhis-foundation';
import { intermediateSiddhis } from './siddhis-intermediate';
import { advancedSiddhis } from './siddhis-advanced';
import { restrictedSiddhis } from './siddhis-restricted';
import { supplementarySiddhis } from './siddhis-supplementary';
import { aghoriSiddhis } from './siddhis-aghori';

export const allSiddhis: Siddhi[] = [
  ...foundationSiddhis,
  ...intermediateSiddhis,
  ...advancedSiddhis,
  ...restrictedSiddhis,
  ...supplementarySiddhis,
  ...aghoriSiddhis,
];

export function getSiddhiBySlug(slug: string): Siddhi | undefined {
  return allSiddhis.find(s => s.slug === slug);
}

export const SIDDHI_COUNT = allSiddhis.length;
