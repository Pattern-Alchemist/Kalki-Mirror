'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { pricingTiers, formatPrice } from '@/lib/data/pricing';
import { useTier } from '@/components/layout/TierProvider';
import type { Tier, Currency } from '@/lib/data/types';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import { staggerContainer, staggerItem } from '@/lib/motion/tokens';

const TIER_ORDER: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];
const WHATSAPP_NUMBER = '918920862931';

type BillingCycle = 'monthly' | 'yearly';

const ELEMENT_LABELS: Record<Tier, string> = {
  prithvi: 'Prithvi / Earth',
  jal: 'Jal / Water',
  agni: 'Agni / Fire',
  akash: 'Akash / Sky',
};

const TRUST_SIGNALS = [
  '3-Day Free Trial on Jal',
  'Cancel Anytime',
  'Razorpay / Stripe Secure',
  'WhatsApp Support',
];

interface FAQItem { question: string; answer: string; }

const FAQ_DATA: FAQItem[] = [
  { question: 'What siddhis are included in the free tier?', answer: 'The free Prithvi tier includes six foundational siddhis covering mantra repetition, breath purification, non-dual contemplation, and ritual practice. These are drawn from authentic tantric texts like the Upaniṣads, Haṭha Yoga Pradīpikā, and Smārta tradition. They provide a solid base for deeper exploration.' },
  { question: 'Can I switch between plans?', answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you gain immediate access to the new tier content. When downgrading, your current tier remains active until the end of your billing cycle. All changes are managed via WhatsApp for personal attention.' },
  { question: 'Is the content authentic tantric tradition?', answer: 'Every practice, mantra, and lineage reference on AstroKalki is sourced from recognized tantric texts — Upaniṣads, Tantras, Āgamas, Haṭha Yoga corpus, and Pāñcarātra Āgamas. Each siddhi includes an authenticity score calculated from textual attestation, lineage continuity, and experiential verification. Sources are individually rated as high, medium, or low confidence.' },
  { question: 'How do guru sessions work?', answer: 'Guru sessions are conducted via WhatsApp video call. Agni members receive one 15-minute monthly session focused on practice review and guidance. Akash members receive weekly 60-minute sessions covering deep practice, siddhi transmission, and personalized ritual design. Sessions are scheduled via WhatsApp at mutual convenience.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards, UPI, net banking, and popular wallets via Razorpay for Indian users. International users can pay with any card through Stripe. All transactions are encrypted and PCI-compliant. Subscription management is handled personally via WhatsApp for human touch.' },
];
function GoldCheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#b8952f" fillOpacity="0.12" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="#b8952f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIconSmall() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#b8952f" fillOpacity="0.06" />
      <rect x="6.5" y="9.5" width="7" height="5.5" rx="1.5" stroke="#b8952f" strokeWidth="1.2" opacity="0.5" />
      <path d="M8 9.5V7.5C8 6.1 9 5 10 5C11 5 12 6.1 12 7.5V9.5" stroke="#b8952f" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7V12C3 16.97 6.93 21.59 12 22.5C17.07 21.59 21 16.97 21 12V7L12 2Z" stroke="#b8952f" strokeWidth="1.5" strokeLinejoin="round" fill="#b8952f" fillOpacity="0.06" />
      <path d="M8 12.5L10.5 15L16 9.5" stroke="#b8952f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
 );
}

function getHigherTierName(slug: Tier): string {
  const idx = TIER_ORDER.indexOf(slug);
  if (idx < TIER_ORDER.length - 1) return TIER_LABELS[TIER_ORDER[idx + 1]];
  return 'a higher tier';
}

function buildWhatsAppLink(tierName: string, priceStr: string, cycle: BillingCycle, cur: Currency): string {
  const period = cycle === 'yearly' ? 'yr' : 'mo';
  const msg = `I'd like to subscribe to ${tierName} (${priceStr}/${period}). Currency: ${cur}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
export default function PricingPage() {
  const { tier: currentTier, currency, setCurrency } = useTier();
  const reduced = useReducedMotion();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleFAQToggle = useCallback((idx: number) => setOpenFAQ((prev) => (prev === idx ? null : idx)), []);

  const handleCTA = useCallback((tierId: Tier) => {
    const t = pricingTiers.find((x) => x.id === tierId);
    if (!t) return;
    const price = billing === 'monthly' ? (currency === 'INR' ? t.priceINR : t.priceUSD) : (currency === 'INR' ? t.yearlyINR : t.yearlyUSD);
    const priceStr = formatPrice(price ?? 0, currency);
    const waLink = buildWhatsAppLink(t.element, priceStr, billing, currency);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  }, [billing, currency]);

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero image="/assets/tantra/bhairava-pathway.jpeg" title="Choose Your Depth" subtitle="From free exploration to advanced siddhi transmission. Every tier unlocks deeper layers." sectionLabel="Sacred Offerings" />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Currency + Billing toggles */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <div className="glass-chip p-1 flex gap-1">
            <button onClick={() => setCurrency('INR')} className={`px-5 py-2 rounded text-sm font-ui tracking-wider uppercase transition-all ${currency === 'INR' ? 'bg-gold text-deep-black' : 'text-text-muted hover:text-gold-dim'}`}>INR</button>
            <button onClick={() => setCurrency('USD')} className={`px-5 py-2 rounded text-sm font-ui tracking-wider uppercase transition-all ${currency === 'USD' ? 'bg-gold text-deep-black' : 'text-text-muted hover:text-gold-dim'}`}>USD</button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setBilling('monthly')} className={`text-sm transition-colors ${billing === 'monthly' ? 'text-foreground font-semibold' : 'text-text-muted hover:text-text-secondary'}`}>Monthly</button>
            <div className="w-px h-4 bg-text-muted/30" />
            <button onClick={() => setBilling('yearly')} className={`text-sm transition-colors flex items-center gap-2 ${billing === 'yearly' ? 'text-foreground font-semibold' : 'text-text-muted hover:text-text-secondary'}`}>
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold text-[10px] font-bold uppercase tracking-wider">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Tier cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial={reduced ? { opacity: 1 } : staggerContainer.hidden} animate={staggerContainer.visible}>
          {pricingTiers.map((tier) => {
            const isCurrent = currentTier === tier.id;
            const isPaid = (tier.priceINR ?? 0) > 0;
            const price = billing === 'monthly' ? (currency === 'INR' ? tier.priceINR : tier.priceUSD) : (currency === 'INR' ? tier.yearlyINR : tier.yearlyUSD);
            const monthlyPrice = tier.priceINR ?? 0;
            return (
              <motion.div key={tier.id} variants={staggerItem} className={"relative bg-surface rounded-lg p-6 border transition-all flex flex-col" + ((tier.popular || tier.highlight) ? 'border-gold shadow-lg shadow-gold/10 scale-[1.02]' : 'border-[var(--border-subtle)] hover:border-gold-dim')} style={{ borderTopColor: tier.color ?? 'transparent', borderTopWidth: '4px', borderTopStyle: 'solid' }}>
                {(tier.popular || tier.highlight) && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-deep-black text-xs font-bold px-3 py-1 rounded-full z-10 whitespace-nowrap">MOST POPULAR</span>}
                <p className="text-text-muted text-xs font-ui uppercase tracking-wider mb-3">{ELEMENT_LABELS[tier.id]}</p>
                <h3 className="font-display text-2xl text-foreground mb-1">{TIER_LABELS[tier.id]}</h3>
                <p className="text-gold text-sm font-display mb-4">{tier.elementSanskrit}</p>
                <div className="mb-2">
                  {billing === 'yearly' && isPaid && monthlyPrice > 0 && <p className="text-text-muted text-sm line-through mb-1">{formatPrice(monthlyPrice, currency)}/mo</p>}
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl text-foreground">{formatPrice(price ?? 0, currency)}</span>
                    {isPaid && <span className="text-text-muted text-sm">/{billing === 'monthly' ? 'mo' : 'mo'}</span>}
                  </div>
                  {billing === 'yearly' && isPaid && <p className="text-gold-dim text-xs mt-1">billed annually</p>}
                </div>
                {tier.description && <p className="text-text-secondary text-sm leading-relaxed mb-6">{tier.description}</p>}
                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-1">
                  {(tier.features ?? tier.unlocks).map((f, fi) => (
                    <li key={fi} className="flex items-start gap-2.5"><span className="mt-0.5 shrink-0"><GoldCheckIcon /></span><span className="text-text-secondary text-sm leading-relaxed">{f}</span></li>
                  ))}
                  {(tier.gatedFeatures ?? []).map((f, gi) => (
                    <li key={`g-${gi}`} className="flex items-start gap-2.5 opacity-50">
                      <span className="mt-0.5 shrink-0"><LockIconSmall /></span>
                      <span className="text-text-muted text-sm leading-relaxed line-through">{f}</span>
                    </li>
                  ))}
                  {(tier.gatedFeatures ?? []).length > 0 && <li className="pl-6"><span className="text-text-muted/50 text-xs italic">Requires {getHigherTierName(tier.id)}</span></li>}
                </ul>
                {/* CTA */}
                <div className="mt-auto">
                  {isCurrent ? (
                    <button disabled className="ghost-cta w-full opacity-40 cursor-not-allowed border-[var(--border-subtle)]">Current Plan</button>
                  ) : tier.id === 'prithvi' ? (
                    <button onClick={() => handleCTA('prithvi')} className="ghost-cta w-full">Get Started</button>
                  ) : (
                    <button onClick={() => handleCTA(tier.id)} className="gold-cta w-full">{tier.cta ?? `Choose ${TIER_LABELS[tier.id]}`}</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          {TRUST_SIGNALS.map((s, i) => (
            <div key={i} className="flex items-center gap-2"><ShieldCheckIcon /><span className="text-text-secondary text-sm">{s}</span></div>
          ))}
        </div>

        {/* Guarantee */}
        <div className="glass-chip text-center max-w-2xl mx-auto mt-12 p-8">
          <h3 className="font-display text-xl text-gold mb-2">Sacred Guarantee</h3>
          <p className="text-text-secondary text-sm leading-relaxed">If you don't feel a tangible shift in your practice within 14 days, we'll refund every rupee. No questions asked. Your spiritual journey is too important for compromise.</p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mt-16">
          <h3 className="font-display text-2xl text-foreground text-center mb-8">Frequently Asked Questions</h3>
          <div>
            {FAQ_DATA.map((item, i) => (
              <div key={i} className="border-b border-[var(--border-subtle)]">
                <button onClick={() => handleFAQToggle(i)} className="w-full flex items-center justify-between py-5 text-left group" aria-expanded={openFAQ === i}>
                  <span className="font-display text-lg text-foreground group-hover:text-gold transition-colors">{item.question}</span>
                  <span className={`text-gold transition-transform duration-300 ${openFAQ === i ? 'rotate-180' : ''}`}>&#x25BC;</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFAQ === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                      <p className="text-text-secondary text-sm leading-relaxed pb-5">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}