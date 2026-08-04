'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { PatternCard } from '@/components/patterns/PatternCard';
import { PricingCards } from '@/components/monetization/PricingCards';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { BreathTimer } from '@/components/practice/BreathTimer';

export default function HomePage() {
  const reduced = useReducedMotion();
  const featured = allSiddhis.slice(0, 3);
  const patternPreview = allPatterns.slice(0, 4);

  return (
    <div className="bg-deep-black">
      {/* ===== BAND 1: THRESHOLD HERO ===== */}
      <section className="relative h-screen flex items-end">
        <CinematicImage
          src="/assets/tantra/Ancient_observatory_with_astrola…_202608031904_3.jpeg"
          alt="Ancient observatory under the Milky Way"
          kenBurns="slow"
          scrim="full"
          priority
        />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-24 md:pb-32">
          <motion.h1
            className="font-display text-5xl md:text-7xl lg:text-8xl gold-foil-text leading-[0.95] mb-6"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            AstroKalki
          </motion.h1>
          <motion.p
            className="text-text-secondary text-lg md:text-xl max-w-xl mb-10"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            The same pain. Different face. Same pattern.
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link href="/archive" className="gold-cta">Enter the Archive</Link>
            <Link href="/practice" className="ghost-cta">Begin Your Practice</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== BAND 2: TWO DOORS ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* Archive Door */}
        <Link href="/archive" className="group relative h-[60vh] overflow-hidden">
          <CinematicImage
            src="/assets/tantra/Cave_with_yantras_inscriptions_202608031904.jpeg"
            alt="Ancient cave with yantra inscriptions"
            kenBurns="normal"
            scrim="bottom"
          />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
            <p className="section-label mb-3">The Living Archive</p>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-2">
              41 Siddhis. Mapped.
            </h2>
            <p className="text-text-secondary text-sm max-w-sm">
              Scholarly. Sourced. Every mantra, every lineage, every warning.
            </p>
          </div>
        </Link>

        {/* Practice Door */}
        <Link href="/practice" className="group relative h-[60vh] overflow-hidden">
          <CinematicImage
            src="/assets/tantra/Meditation_platform_overlooking_…_202608031904_3.jpeg"
            alt="Meditation platform overlooking misty valley"
            kenBurns="normal"
            scrim="bottom"
          />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12">
            <p className="section-label mb-3">The Mirror Method</p>
            <h2 className="font-display text-3xl md:text-4xl text-white mb-2">
              See Yourself. Clearly.
            </h2>
            <p className="text-text-secondary text-sm max-w-sm">
              Breathwork, japa, journaling — guided tools for inner work.
            </p>
          </div>
        </Link>
      </section>

      {/* ===== BAND 3: FEATURED SIDDHIS ===== */}
      <section className="relative py-24 md:py-32">
        <CinematicImage
          src="/assets/tantra/Black_granite_temple_Kali_monsoon_202608031904.jpeg"
          alt="Black granite temple in monsoon rain"
          scrim="full"
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            From the Archive
          </motion.p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true }}
          >
            {featured.map((s) => (
              <motion.div key={s.slug} variants={staggerItem}>
                <SiddhiCard siddhi={s} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-10 text-center"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <Link href="/archive" className="ghost-cta text-sm">
              Browse All 41 Siddhis
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== BAND 4: PATTERN PREVIEW ===== */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <motion.p
            className="section-label mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            The Mirror Method
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-4xl text-foreground mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Your patterns have names.
          </motion.h2>
          <motion.p
            className="text-text-secondary max-w-xl mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Every emotional loop, every recurring relationship dynamic — they map
            to ancient sādhanas designed for exactly this.
          </motion.p>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true }}
          >
            {patternPreview.map((p) => (
              <motion.div key={p.slug} variants={staggerItem}>
                <PatternCard pattern={p} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-10 text-center"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <Link href="/patterns" className="ghost-cta text-sm">
              Explore the Pattern Atlas
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== BAND 5: BREATH TIMER ===== */}
      <section className="py-24 md:py-32 bg-deep-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.p
            className="section-label mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Practice Now
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-4xl mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Breathe.
          </motion.h2>
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <BreathTimer patternSlug="nadi-shuddhi-basic" />
          </motion.div>
        </div>
      </section>

      {/* ===== BAND 6: PRICING GATE ===== */}
      <section className="relative py-24 md:py-32">
        <CinematicImage
          src="/assets/tantra/Forgotten_forest_shrine_ancient_…_202608031904.jpeg"
          alt="Forgotten forest shrine with glowing doorway"
          scrim="full"
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-4">Choose Your Depth</p>
            <h2 className="font-display text-3xl md:text-4xl">Four paths. One purpose.</h2>
          </motion.div>
          <PricingCards />
        </div>
      </section>

      {/* ===== CONSULTATION CTA ===== */}
      <section className="py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.p
            className="section-label mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Beyond the Archive
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-4xl mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Speak with someone who listens.
          </motion.h2>
          <motion.p
            className="text-text-secondary mb-10"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Kaustubh offers personal consultations that bridge the
            ancient map and your lived experience.
          </motion.p>
          <WhatsAppCTA variant="inline" label="Book with Kaustubh" />
        </div>
      </section>
    </div>
  );
}
