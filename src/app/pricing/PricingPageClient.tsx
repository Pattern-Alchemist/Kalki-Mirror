'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { PageHero } from '@/components/layout/PageHero';
import { formatPrice } from '@/lib/data/pricing';
import type { Tier, PricingTier } from '@/lib/data/types';
import { useTier } from '@/components/layout/TierProvider';
import type { Currency } from '@/lib/data/pricing';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import { BackButton } from '@/components/nav/BackButton';
import dynamic from 'next/dynamic';
import { staggerContainer, staggerItem, fadeInUp } from '@/lib/motion/tokens';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface PricingPageProps {
  pricingTiers: PricingTier[];
}

const PricingQuiz = dynamic(() => import('@/components/ai/PricingQuiz').then(m => ({ default: m.PricingQuiz })), { ssr: false, loading: () => <div className="h-48" /> });

const TIER_ORDER: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];
const WHATSAPP_NUMBER = '918920862931';

type BillingCycle = 'monthly' | 'yearly';

const ELEMENT_LABELS: Record<Tier, string> = {
  prithvi: 'Prithvi',
  jal: 'Jal',
  agni: 'Agni',
  akash: 'Akash',
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
  { question: 'Is the content authentic tantric tradition?', answer: 'Every practice, mantra, and lineage reference on KALKI is sourced from recognized tantric texts — Upaniṣads, Tantras, Āgamas, Haṭha Yoga corpus, and Pāñcarātra Āgamas. Each siddhi includes an authenticity score calculated from textual attestation, lineage continuity, and experiential verification.' },
  { question: 'How do guru sessions work?', answer: 'Guru sessions are conducted via WhatsApp video call. Agni members receive one 15-minute monthly session focused on practice review and guidance. Akash members receive weekly 60-minute sessions covering deep practice, siddhi transmission, and personalized ritual design.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards, UPI, net banking, and popular wallets via Razorpay for Indian users. International users can pay with any card through Stripe. All transactions are encrypted and PCI-compliant.' },
];
function GoldCheckIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#C5A059" fillOpacity="0.1" />
      <path d="M6 10.5L8.5 13L14 7.5" stroke="#C5A059" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIconSmall() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#C5A059" fillOpacity="0.04" />
      <rect x="6.5" y="9.5" width="7" height="5.5" rx="1.5" stroke="#C5A059" strokeWidth="1.2" opacity="0.4" />
      <path d="M8 9.5V7.5C8 6.1 9 5 10 5C11 5 12 6.1 12 7.5V9.5" stroke="#C5A059" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7V12C3 16.97 6.93 21.59 12 22.5C17.07 21.59 21 16.97 21 12V7L12 2Z" stroke="#C5A059" strokeWidth="1.5" strokeLinejoin="round" fill="#C5A059" fillOpacity="0.04" />
      <path d="M8 12.5L10.5 15L16 9.5" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
  const msg = `I would like to subscribe to ${tierName} (${priceStr}/${period}). Currency: ${cur}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
export default function PricingPageClient({ pricingTiers: tiers }: PricingPageProps) {
  const { tier: currentTier, currency, setCurrency } = useTier();
  const reduced = useNativeReducedMotion();
  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const handleFAQToggle = useCallback((idx: number) => setOpenFAQ((prev) => (prev === idx ? null : idx)), []);

  const handleCTA = useCallback((tierId: Tier) => {
    const t = tiers.find((x) => x.id === tierId);
    if (!t) return;
    const price = billing === 'monthly' ? (currency === 'INR' ? t.priceINR : t.priceUSD) : (currency === 'INR' ? t.yearlyINR : t.yearlyUSD);
    const priceStr = formatPrice(price ?? 0, currency);
    const tierLabel = TIER_LABELS[tierId];
    const waLink = buildWhatsAppLink(tierLabel, priceStr, billing, currency);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  }, [billing, currency]);

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/pricing/fire-ritual-yantra-hero' title="The Covenant" subtitle="Four access levels. One path to Shambhala. Each tier unlocks deeper layers of the Akashic Archive." sectionLabel="Sacred Offerings" minH='min-h-[90vh] md:min-h-[100vh]' />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <BackButton href="/" label="Back to Home" className="mb-10" />

        {/* AI Plan Recommendation Quiz */}
        <div className="mb-16">
          <PricingQuiz />
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-20">
          <div className="glass-chip p-1 flex gap-1">
            <button onClick={() => setCurrency('INR')} className={`min-h-[44px] px-6 py-2.5 rounded-sm text-[0.65rem] font-ui tracking-[0.15em] uppercase transition-all duration-400 ${currency === 'INR' ? 'bg-gold text-deep-black' : 'text-text-muted hover:text-gold-dim'}`}>INR</button>
            <button onClick={() => setCurrency('USD')} className={`min-h-[44px] px-6 py-2.5 rounded-sm text-[0.65rem] font-ui tracking-[0.15em] uppercase transition-all duration-400 ${currency === 'USD' ? 'bg-gold text-deep-black' : 'text-text-muted hover:text-gold-dim'}`}>USD</button>
          </div>
          <div className="flex items-center gap-4" role="radiogroup" aria-label="Billing cycle">
            <button role="radio" aria-checked={billing === 'monthly'} onClick={() => setBilling('monthly')} className={`min-h-[44px] px-3 text-sm transition-colors duration-400 ${billing === 'monthly' ? 'text-foreground font-medium' : 'text-text-muted hover:text-text-secondary'}`}>Monthly</button>
            <div className="w-px h-4 bg-gold/10" />
            <button role="radio" aria-checked={billing === 'yearly'} onClick={() => setBilling('yearly')} className={`min-h-[44px] px-3 text-sm transition-colors duration-400 flex items-center gap-3 ${billing === 'yearly' ? 'text-foreground font-medium' : 'text-text-muted hover:text-text-secondary'}`}>
              Yearly
              <span className="px-2.5 py-1 rounded-full bg-gold/10 text-gold text-[0.8125rem] font-bold uppercase tracking-wider">Save 17%</span>
            </button>
          </div>
        </div>

        {/* ── EDITORIAL: Access Philosophy ── */}
        <div className="max-w-2xl mx-auto mb-16 space-y-4 text-text-secondary text-sm leading-relaxed editorial-spacing">
          <p>
            The KALKI access structure follows the Tantric principle of <em>adhikāra-bheda</em> — the distinction of qualification. In every living lineage, the guru does not teach the same practice to everyone. The beginner receives foundational purification; the intermediate practitioner receives transformative techniques; the advanced initiate receives direct transmission. This is not elitism but precision — giving a practitioner a technique they are not prepared for does not accelerate their growth, it creates energetic instability that can take months to correct.
          </p>
          <p>
            The four tiers — Prithvi (Earth), Jal (Water), Agni (Fire), Akash (Space) — map to the classical <em>tattva</em> (element) progression found in both Śaiva and Śākta cosmologies. Prithvi establishes the ground: basic siddhis, foundational breathwork, and the Mirror Method framework. Jal deepens the current: intermediate siddhis, full archive access, and breathwork retention. Agni ignites transformation: advanced siddhis, live consultations, and guru sessions. Akash dissolves boundaries: unrestricted access, priority guidance, and personal practice design. Each tier is a complete stage — not a partial version of the next.
          </p>
        </div>

        {/* Tier cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" initial={reduced ? { opacity: 1 } : staggerContainer.hidden} animate={staggerContainer.visible}>
          {tiers.map((tier) => {
            const isCurrent = currentTier === tier.id;
            const isPaid = (tier.priceINR ?? 0) > 0;
            const price = billing === 'monthly' ? (currency === 'INR' ? tier.priceINR : tier.priceUSD) : (currency === 'INR' ? tier.yearlyINR : tier.yearlyUSD);
            const monthlyPrice = tier.priceINR ?? 0;
            return (
              <motion.div key={tier.id} variants={staggerItem} className={"glass-chip relative p-6 md:p-8 flex flex-col" + ((tier.popular || tier.highlight) ? ' border-gold' : '')} style={{ borderTopColor: tier.color ?? 'transparent', borderTopWidth: '3px', borderTopStyle: 'solid' }}>
                {(tier.popular || tier.highlight) && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-deep-black text-[0.8125rem] font-bold px-3 py-1 rounded-full z-10 whitespace-nowrap tracking-wider uppercase">Most Popular</span>}
                <p className="text-caption mb-4">{ELEMENT_LABELS[tier.id]}</p>
                <h3 className="font-display text-2xl text-foreground mb-1">{TIER_LABELS[tier.id]}</h3>
                <p className="text-gold text-sm font-display mb-6 italic">{tier.elementSanskrit}</p>
                <div className="mb-3">
                  {billing === 'yearly' && isPaid && monthlyPrice > 0 && <p className="text-text-muted text-sm line-through mb-1">{formatPrice(monthlyPrice, currency)}/mo</p>}
                  <div className="flex items-baseline gap-1">
                    {(price ?? 0) > 0 ? (
                      <span className="font-display text-4xl text-foreground">
                        {currency === 'INR' ? '\u20B9' : '$'}<AnimatedCounter target={price ?? 0} />
                      </span>
                    ) : (
                      <span className="font-display text-4xl text-foreground">Free</span>
                    )}
                    {isPaid && <span className="text-text-muted text-sm">/mo</span>}
                  </div>
                  {billing === 'yearly' && isPaid && <p className="text-gold-dim text-xs mt-1">billed annually</p>}
                </div>
                {tier.description && <p className="text-text-secondary text-sm leading-relaxed mb-8">{tier.description}</p>}
                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {(tier.features ?? tier.unlocks).map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3"><span className="mt-0.5 shrink-0"><GoldCheckIcon /></span><span className="text-text-secondary text-sm leading-relaxed">{f}</span></li>
                  ))}
                  {(tier.gatedFeatures ?? []).map((f, gi) => (
                    <li key={`g-${gi}`} className="flex items-start gap-3 opacity-75">
                      <span className="mt-0.5 shrink-0"><LockIconSmall /></span>
                      <span className="text-text-secondary text-sm leading-relaxed line-through" style={{ color: '#7A7A72' }}>{f}</span>
                    </li>
                  ))}
                  {(tier.gatedFeatures ?? []).length > 0 && <li className="pl-7"><span className="text-xs italic" style={{ color: '#8A8A85' }}>Requires {getHigherTierName(tier.id)}</span></li>}
                </ul>
                {/* CTA */}
                <div className="mt-auto">
                  {isCurrent ? (
                    <button disabled className="ghost-cta w-full opacity-30 cursor-not-allowed">Current Access</button>
                  ) : tier.id === 'prithvi' ? (
                    <button onClick={() => handleCTA('prithvi')} className="ghost-cta w-full">Enter Prithvi</button>
                  ) : (
                    <button onClick={() => handleCTA(tier.id)} className="gold-cta w-full">{tier.cta ?? 'Enter'}</button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Cinematic Parallax Interlude ── */}
        <ScrollParallax speed={-0.06}>
          <div className="relative h-[25vh] md:h-[30vh] overflow-hidden -mx-6 lg:-mx-10 my-16">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/pricing/prithvi-card-bg'
              alt="The sacred path"
              kenBurns="slow"
              scrim="full"
              vignette
              fog
            />
          </div>
        </ScrollParallax>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-10 mt-20">
          {TRUST_SIGNALS.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5"><ShieldCheckIcon /><span className="text-text-secondary text-sm">{s}</span></div>
          ))}
        </div>

        {/* ── Second Parallax Interlude (before guarantee) ── */}
        <ScrollParallax speed={0.04}>
          <div className="relative h-[15vh] overflow-hidden -mx-6 lg:-mx-10 my-16">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/pricing/stone-yantra-divider'
              alt="Sri Yantra sky"
              kenBurns="slow"
              scrim="full"
              vignette
            />
          </div>
        </ScrollParallax>

        {/* Guarantee */}
        <motion.div
          className="glass-panel text-center max-w-2xl mx-auto mt-16 p-10 md:p-12"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-2xl text-gold mb-3 text-glow-subtle font-light tracking-wide">Sacred Guarantee</h3>
          <p className="text-editorial">If you don&apos;t feel a tangible shift in your practice within 14 days, we&apos;ll refund every rupee. No questions asked. Your spiritual journey is too important for compromise.</p>
        </motion.div>

        {/* FAQ */}
        <motion.div
          className="max-w-2xl mx-auto mt-24"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-2xl text-foreground text-center mb-12 engraved-heading">Frequently Asked Questions</h3>

          {/* ── Always-visible FAQ highlights for SEO ── */}
          <div className="space-y-6 mb-12 text-text-secondary text-sm leading-relaxed editorial-spacing">
            <div>
              <h4 className="font-display text-base text-foreground mb-2">{FAQ_DATA[0].question}</h4>
              <p>{FAQ_DATA[0].answer}</p>
            </div>
            <div>
              <h4 className="font-display text-base text-foreground mb-2">{FAQ_DATA[2].question}</h4>
              <p>{FAQ_DATA[2].answer}</p>
            </div>
          </div>

          <div>
            {FAQ_DATA.map((item, i) => (
              <div key={i} className="border-b border-gold/5">
                <button type="button" onClick={() => handleFAQToggle(i)} className="w-full flex items-center justify-between py-6 text-left group min-h-[44px]" aria-expanded={openFAQ === i} aria-controls={`faq-panel-${i}`}>
                  <span className="font-display text-lg text-foreground group-hover:text-gold transition-colors duration-500">{item.question}</span>
                  <span className={`text-gold-dim transition-transform duration-500 ${openFAQ === i ? 'rotate-180' : ''}`}>&#x25BC;</span>
                </button>
                <AnimatePresence initial={false}>
                  {openFAQ === i && (
                    <motion.div id={`faq-panel-${i}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden">
                      <p className="text-editorial pb-6">{item.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}