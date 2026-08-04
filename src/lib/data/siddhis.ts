import type { Siddhi } from './types';
import { foundationSiddhis } from './siddhis-foundation';
import { intermediateSiddhis } from './siddhis-intermediate';
import { advancedSiddhis } from './siddhis-advanced';
import { restrictedSiddhis } from './siddhis-restricted';

export const allSiddhis: Siddhi[] = [
  ...foundationSiddhis,
  ...intermediateSiddhis,
  ...advancedSiddhis,
  ...restrictedSiddhis,
];

export function getSiddhiBySlug(slug: string): Siddhi | undefined {
  return allSiddhis.find(s => s.slug === slug);
}
