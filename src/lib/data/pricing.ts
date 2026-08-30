import type { PricingTier } from './types';

export const pricingTiers: PricingTier[] = [
  {
    id: 'prithvi',
    element: 'Earth',
    elementSanskrit: '\u092A\u0943\u0925\u094D\u0935\u0940',
    priceINR: 0,
    priceUSD: 0,
    yearlyINR: 0,
    yearlyUSD: 0,
    annualDiscount: '0%',
    description: 'Begin your journey with foundational sadhanas, breath work, and community wisdom. The earth beneath your feet \u2014 steady, grounded, free.',
    features: [
      '6 Foundation siddhis with full lineage guides',
      'Breath Timer (3 patterns)',
      'Shadow Pattern Recognition toolkit (3 patterns)',
      'Japa Mala counter',
      'Community forum access',
    ],
    gatedFeatures: [],
    sadhanaAccess: 'basic',
    cta: 'Prithvi',
    unlocks: [],
    highlight: false,
  },
  {
    id: 'jal',
    element: 'Water',
    elementSanskrit: '\u091C\u0932',
    priceINR: 499,
    priceUSD: 9,
    yearlyINR: 4990,
    yearlyUSD: 90,
    annualDiscount: '17%',
    description: 'Flow deeper into the tradition. Access all 15 intermediate siddhis with full descriptions, advanced pattern diagnostics, and the whisper of forbidden rituals.',
    features: [
      'All 15 Foundation + Intermediate siddhis',
      '5 breath patterns',
      'Pattern Atlas with 12 psychological patterns',
      'Japa history & streaks',
      'Shadow pattern deep-dive (9 more patterns)',
      'Email support',
      'Forbidden ritual teasers',
    ],
    gatedFeatures: [
      'Mantra audio library',
      'Guided ritual protocols',
      'Custom yantra work',
    ],
    sadhanaAccess: 'standard',
    cta: 'Jal',
    unlocks: [],
    highlight: true,
    popular: true,
  },
  {
    id: 'agni',
    element: 'Fire',
    elementSanskrit: '\u0905\u0917\u094D\u0928\u093F',
    priceINR: 1499,
    priceUSD: 29,
    yearlyINR: 14990,
    yearlyUSD: 290,
    annualDiscount: '17%',
    description: 'Ignite the inner fire. Mantra libraries, guided rituals, monthly guru calls, and the first gates of siddhi practice open before you.',
    features: [
      'Everything in Jal',
      'Mantra audio library (50+ mantras)',
      'Guided ritual protocols',
      'Detailed chakra diagnostics',
      'Priority WhatsApp support',
      '1 monthly guru call (15 min)',
      'Forbidden ritual access',
      'Siddhi practice basics',
      'Custom practice plans',
    ],
    gatedFeatures: [
      '1-on-1 deep guru sessions',
      'Custom yantra design',
      'Advanced siddhi transmission',
      'Retreat invitations',
    ],
    sadhanaAccess: 'advanced',
    cta: 'Enter',
    unlocks: [],
    highlight: false,
  },
  {
    id: 'akash',
    element: 'Sky / Space',
    elementSanskrit: '\u0906\u0915\u093E\u0936',
    priceINR: 4999,
    priceUSD: 99,
    yearlyINR: 49990,
    yearlyUSD: 990,
    annualDiscount: '17%',
    description: 'The innermost circle. Unlimited access to the guru, advanced siddhi transmissions, custom yantras, retreats, and the deepest teachings of the tradition.',
    features: [
      'Everything in Agni',
      'All 56 siddhis (including 10 restricted)',
      'Weekly 1-on-1 guru sessions (60 min)',
      'Custom yantra design & ritual',
      'Advanced siddhi practices (forbidden)',
      'Retreat invitations',
      '24/7 direct guru access',
      'Scholarly source library access',
      'Lifetime updates',
    ],
    gatedFeatures: [],
    sadhanaAccess: 'all',
    cta: 'Ascend',
    unlocks: [],
    highlight: false,
  },
];

export type Currency = 'INR' | 'USD';

/**
 * Detect user's preferred currency — Phase C: edge geo first, locale fallback.
 * `kr_country` (set by middleware from Vercel's x-vercel-ip-country) is
 * server-truth about where the visitor is served; locale is only a heuristic
 * (an en-US browser in India, an Indian diaspora browser in the US, …).
 * India → INR; any other known country → USD; unknown/no cookie → locale.
 */
export function detectCurrency(): Currency {
  // 1 · Edge geo cookie (client-side read; SSR sees neither cookie nor navigator → INR default)
  if (typeof document !== 'undefined') {
    const hit = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('kr_country='));
    const country = hit ? decodeURIComponent(hit.slice('kr_country='.length)) : null;
    if (country && /^[A-Za-z]{2}$/.test(country)) return country.toUpperCase() === 'IN' ? 'INR' : 'USD';
  }
  // 2 · Locale heuristic (pre-Phase-C behavior, unchanged)
  if (typeof navigator === 'undefined') return 'INR';
  const lang = navigator.language || (Intl.DateTimeFormat().resolvedOptions()?.locale ?? '');
  if (/\b(IN|hi|bn|te|ta|kn|ml|mr|gu|or|pa|as|ur)\b/i.test(lang)) return 'INR';
  return 'USD';
}

/**
 * Format price for display.
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (amount === 0) return 'Free';
  if (currency === 'INR') return `\u20B9${amount.toLocaleString('en-IN')}`;
  return `$${amount.toLocaleString('en-US')}`;
}
