'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      {/* ===== CHAMBER I: ARRIVAL — The Initiation ===== */}
      <section className="relative h-[110vh] md:h-[120vh] flex items-end overflow-hidden">
        <CinematicImage
          src="/assets/tantra/hero-main.jpeg"
          alt="Ancient trident in stone courtyard"
          kenBurns="slow"
          scrim="full"
          vignette
          volumetric
          dust
          priority
        />
        {/* Extra top darkness for nav readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-deep-black/60 to-transparent z-[3] pointer-events-none" />
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-28 md:pb-40">
          {/* Yantra Mark — the brand emerges from the dark */}
          <motion.div
            className="mb-10"
            initial={reduced ? { opacity: 0.8 } : { opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 0.8, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/logo.svg"
              alt="Kalki Yantra — The Mark of Discernment"
              width={64}
              height={64}
              className="opacity-80"
              priority
            />
          </motion.div>

          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            <p className="section-label mb-6 text-glow-subtle">Esoteric Intelligence</p>
            <h1 className="text-display gold-foil-text text-glow mb-6">
              KALKI
            </h1>
            <p className="text-gold-dim font-ui text-xs tracking-[0.3em] uppercase mb-10">
              Light for the Dark Age.
            </p>
            <motion.p
              className="text-text-secondary text-lg md:text-xl max-w-lg editorial-spacing"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              The same pain. Different face. Same pattern.
            </motion.p>
            <motion.div
              className="flex flex-wrap gap-4 mt-12"
              initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/archive" className="gold-cta">Enter the Akasha</Link>
              <Link href="/practice" className="ghost-cta">Begin Sādhana</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CHAMBER II: THE TWO DOORS — Asymmetric split ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh] md:min-h-[85vh]">
        {/* Archive Door — YANTRA Decoded */}
        <Link href="/archive" className="group relative overflow-hidden">
          <CinematicImage
            src="/assets/tantra/hero-temple.jpeg"
            alt="Sacred ritual items on ancient altar"
            kenBurns="normal"
            scrim="bottom"
            volumetric
            dust
          />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <p className="section-label mb-4 text-glow-subtle">YANTRA Decoded</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 engraved-heading font-light tracking-wide">
              41 Siddhis.<br />Mapped.
            </h2>
            <p className="text-text-secondary text-sm max-w-sm editorial-spacing">
              Decoded by YANTRA. Every mantra, every lineage, every warning.
            </p>
          </div>
        </Link>

        {/* Practice Door — Sādhana Instruments */}
        <Link href="/practice" className="group relative overflow-hidden">
          <CinematicImage
            src="/assets/tantra/hero-fire.jpeg"
            alt="Sadhu with ash and gold markings"
            kenBurns="normal"
            scrim="bottom"
            volumetric
            dust
          />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <p className="section-label mb-4 text-glow-subtle">Sādhana Instruments</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 engraved-heading font-light tracking-wide">
              See Yourself.<br />Clearly.
            </h2>
            <p className="text-text-secondary text-sm max-w-sm editorial-spacing">
              Breathwork, japa, journaling — guided tools for inner work.
            </p>
          </div>
        </Link>
      </section>

      {/* ===== CHAMBER III: EDITORIAL DIVIDER — The Mirror Method ===== */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-28 md:py-40">
        <div className="divider-gold mb-20" />
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="section-label mb-8">The Mirror Method</p>
          <p className="text-sub-display text-foreground mb-8 engraved-heading">
            Your patterns<br />have names.
          </p>
          <p className="text-editorial max-w-xl mx-auto">
            Every emotional loop, every recurring relationship dynamic — they map
            to ancient sādhanas designed for exactly this.
          </p>
        </motion.div>
        <div className="divider-gold mt-20" />
      </div>

      {/* ===== CHAMBER IV: PATTERN ATLAS — Museum grid ===== */}
      <section className="py-20 md:py-32 atmospheric-bg">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.p
            className="section-label mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Pattern Intelligence
          </motion.p>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            {patternPreview.map((p) => (
              <motion.div key={p.slug} variants={staggerItem}>
                <PatternCard pattern={p} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-12 text-center"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <Link href="/patterns" className="ghost-cta text-xs">Decode All 12 Patterns</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CHAMBER V: FEATURED SIDDHIS — Dark museum hall ===== */}
      <section className="relative py-28 md:py-40">
        <CinematicImage
          src="/assets/tantra/hero-manuscript.jpeg"
          alt="Sacred manuscript with geometric patterns"
          scrim="full"
          vignette
          dust
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.p
            className="section-label mb-10"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            From the Akashic Archive
          </motion.p>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            {featured.map((s) => (
              <motion.div key={s.slug} variants={staggerItem}>
                <SiddhiCard siddhi={s} />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="mt-12 text-center"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <Link href="/archive" className="ghost-cta text-xs">Browse All 41 Siddhis</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CHAMBER VI: BREATH — Stillness ===== */}
      <section className="py-28 md:py-40 bg-deep-black atmospheric-bg">
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Practice Now
          </motion.p>
          <motion.h2
            className="font-display text-5xl md:text-7xl text-foreground mb-16 engraved-heading font-light tracking-[0.12em] uppercase"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Breathe.
          </motion.h2>
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <BreathTimer patternSlug="nadi-shuddhi-basic" />
          </motion.div>
        </div>
      </section>

      {/* ===== CHAMBER VII: MEMBERSHIP — Cinematic CTA ===== */}
      <section className="relative py-28 md:py-40">
        <CinematicImage
          src="/assets/tantra/abandoned-temple.jpeg"
          alt="Ancient temple doorway"
          scrim="full"
          vignette
          dust
          className="absolute inset-0"
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            className="text-center mb-20"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-6">Choose Your Depth</p>
            <h2 className="font-display text-4xl md:text-6xl text-white engraved-heading font-light tracking-[0.08em]">
              Four paths.<br />One purpose.
            </h2>
          </motion.div>
          <PricingCards />
        </div>
      </section>

      {/* ===== CHAMBER VIII: CONSULTATION — Quiet CTA ===== */}
      <section className="py-28 md:py-40 atmospheric-bg">
        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Beyond the Archive
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-5xl text-foreground mb-8 engraved-heading font-light tracking-wide"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Consult the Archivist.
          </motion.h2>
          <motion.p
            className="text-editorial mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Kaustubh operates as a Tantric Technologist — identifying your
            recurring behavioral loops and prescribing specific sādhana practices
            from the Akashic Archive designed for your exact pattern.
          </motion.p>
          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <WhatsAppCTA variant="inline" label="Consult the Archivist" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}