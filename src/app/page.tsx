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
      {/* ===== CHAMBER I: ARRIVAL — Hero with Video Background ===== */}
      <section className="relative h-[110vh] md:h-[120vh] flex items-end overflow-hidden">
        {/* Video background — full bleed, behind scrim */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          poster="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-runes-manuscript"
          className="hero-video-bg absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0, objectPosition: 'center' }}
        >
          <source src="https://res.cloudinary.com/b9oo5abp/video/upload/q_auto/kalki-mirror/hero-kalki-avatar-riding.mp4" type="video/mp4" />
        </video>
        {/* Dark scrim ABOVE video, BELOW text */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.65) 40%, rgba(5,5,5,0.82) 100%)',
          }}
        />
        {/* Extra top darkness for nav readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-deep-black/60 to-transparent z-[2] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-28 md:pb-40">
          {/* KALKI — with pulsating neon glow */}
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          >
            {/* Radial glow behind the word */}
            <div className="hero-glow-container relative inline-block">
              <h1 className="hero-glow-text font-display text-white hero-heading tracking-[0.08em] uppercase"
                style={{
                  fontSize: 'clamp(4rem, 10vw, 8rem)',
                  lineHeight: 1,
                }}
              >
                KALKI
              </h1>
            </div>
            <p className="font-ui text-base md:text-lg tracking-[0.35em] uppercase mt-4 mb-10"
              style={{
                color: 'var(--gold-label)',
                textShadow: '0 2px 18px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.15)',
              }}
            >
              Tantrik Intelligence
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 mt-4"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/archive" className="gold-cta">Akashic Library</Link>
            <Link href="/practice" className="ghost-cta">Tantra Siddhis</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CINEMATIC STRIP I — Cave yantras ===== */}
      <div className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-cave-yantras-alt'
          alt="Ancient cave with flickering butter lamps illuminating carved yantras"
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </div>

      {/* ===== CHAMBER II: THE TWO DOORS — Asymmetric split ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh] md:min-h-[85vh]">
        {/* Archive Door — YANTRA Decoded */}
        <Link href="/archive" className="group relative overflow-hidden">
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-cave-yantras'
            alt="Cave with ancient yantra inscriptions and golden butter lamps — the repository of knowledge"
            kenBurns="normal"
            scrim="bottom"
            volumetric
            dust
          />
          <div className="scrim-bottom-anchored" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <p className="section-label mb-4">YANTRA Decoded</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 hero-heading tracking-wide">
              41 Siddhis.<br />Mapped.
            </h2>
            <p className="text-foreground text-base max-w-md editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>
              Decoded by YANTRA. Every mantra, every lineage, every warning.
            </p>
          </div>
        </Link>

        {/* Practice Door — Sadhana Instruments */}
        <Link href="/practice" className="group relative overflow-hidden">
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-mountain-trident'
            alt="Mountain pass with ritual trident under twilight sky — the path of practice"
            kenBurns="normal"
            scrim="bottom"
            volumetric
            dust
          />
          <div className="scrim-bottom-anchored" />
          <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
            <p className="section-label mb-4">Sadhana Instruments</p>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 hero-heading tracking-wide">
              See Yourself.<br />Clearly.
            </h2>
            <p className="text-foreground text-base max-w-md editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>
              Breathwork, japa, meditation — guided tools for inner work.
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
            to ancient sadhanas designed for exactly this.
          </p>
        </motion.div>
        <div className="divider-gold mt-20" />
      </div>

      {/* ===== CINEMATIC STRIP II — Sri Yantra sky ===== */}
      <div className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-sri-yantra-sky'
          alt="Sri Yantra floating above Himalayan peaks at twilight"
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </div>

      {/* ===== CHAMBER IV: PATTERN ATLAS — Museum grid ===== */}
      <section className="relative py-20 md:py-32 section-scrim-dim">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-forest-shrine'
          alt="Forgotten forest shrine draped in mist and ancient light"
          scrim="full"
          vignette
          className="absolute inset-0"
        />
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
            <Link href="/patterns" className="ghost-cta text-sm">Decode All 12 Patterns</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CHAMBER V: FEATURED SIDDHIS — Dark museum hall ===== */}
      <section className="relative py-28 md:py-40">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-forgotten-chamber'
          alt="Forgotten chamber with volumetric god rays illuminating ancient yantras and sacred artifacts"
          scrim="full"
          vignette
          dust
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
            <Link href="/archive" className="ghost-cta text-sm">Browse All 41 Siddhis</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CINEMATIC STRIP III — Underground library ===== */}
      <div className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-underground-library'
          alt="Vast underground library of ancient manuscripts and golden artifacts"
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </div>

      {/* ===== CHAMBER VI: BREATH — Two-column layout with Nadi Shuddhi image ===== */}
      <section className="relative py-20 md:py-28 lg:py-32 bg-deep-black">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* LEFT COLUMN — all text + timer */}
            <div>
              <motion.p
                className="section-label mb-6"
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={fadeInUp.visible}
                viewport={{ once: true }}
              >
                Practice Now
              </motion.p>
              <motion.h2
                className="font-display text-5xl md:text-7xl lg:text-8xl text-white mb-4 hero-heading tracking-[0.12em] uppercase"
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={fadeInUp.visible}
                viewport={{ once: true }}
              >
                Breathe.
              </motion.h2>
              <motion.p
                className="font-ui text-sm tracking-[0.2em] uppercase mb-12"
                style={{ color: 'var(--gold-label)', textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
                initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
                whileInView={fadeInUp.visible}
                viewport={{ once: true }}
              >
                Nadi Shuddhi — Channel Purification
              </motion.p>
              <motion.div
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <BreathTimer patternSlug="nadi-shuddhi-basic" />
              </motion.div>
            </div>

            {/* RIGHT COLUMN — image, gold-framed */}
            <motion.div
              className="relative"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              whileInView={fadeInUp.visible}
              viewport={{ once: true }}
            >
              <div className="relative rounded-lg overflow-hidden aspect-[16/10]"
                style={{
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.06)',
                }}
              >
                <CinematicImage
                  src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/nadi-shuddhi-channel-v2'
                  alt="Nadi Shuddhi channel purification — subtle energy pathways"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CHAMBER VII: MEMBERSHIP — New background with heavy dim ===== */}
      <section className="relative py-28 md:py-40">
        {/* New background image — copper trident courtyard */}
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/copper-trident-courtyard'
          alt="Copper trident in ancient stone courtyard — the depth of commitment"
          className="absolute inset-0"
        />
        {/* Heavy dim overlay for pricing readability */}
        <div className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'rgba(0,0,0,0.8)' }}
        />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            className="text-center mb-20"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-6">Choose Your Depth</p>
            <h2 className="font-display text-4xl md:text-6xl text-white hero-heading tracking-[0.08em]">
              Four paths.<br />One purpose.
            </h2>
          </motion.div>
          <PricingCards />
        </div>
      </section>

      {/* ===== CINEMATIC STRIP IV — Observatory ===== */}
      <div className="cinematic-strip">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-observatory'
          alt="Ancient astronomical observatory with brass instruments under night sky"
          kenBurns="normal"
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </div>

      {/* ===== CHAMBER VIII: CONSULT THE ARCHIVIST CTA BAND ===== */}
      <section className="relative py-28 md:py-40 safe-bottom">
        {/* New background — ancient temple midnight glow */}
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/ancient-temple-midnight'
          alt="Ancient temple at midnight with ethereal golden glow — the inner sanctum"
          className="absolute inset-0"
        />
        {/* Bottom-anchored scrim */}
        <div className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.5) 50%, rgba(5,5,5,0.7) 100%)',
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Enter the Inner Sanctum
          </motion.p>
          <motion.h2
            className="font-display text-3xl md:text-5xl text-white mb-8 hero-heading tracking-wide"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            The Archive Awaits.
          </motion.h2>
          <motion.p
            className="text-foreground text-lg mb-12 editorial-spacing"
            style={{textShadow: '0 1px 8px rgba(0,0,0,0.6)'}}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            Kaustubh is a Tantric Technologist — part technologist, part
            practitioner, part pattern-recognizer. He maps your recurring
            behavioral loops to specific siddhis and sadhanas from the
            Akashic Archive, prescribing exact practices for your exact pattern.
            No guesswork. No generic advice. Just precise, lineage-backed
            intervention designed for where you are right now.
          </motion.p>
          <motion.div
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <WhatsAppCTA variant="inline" label="Consult Kaustubh" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
