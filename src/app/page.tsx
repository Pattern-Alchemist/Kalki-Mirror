'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';

import { motion, useReducedMotion } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { SiddhiCard } from '@/components/archive/SiddhiCard';
import { PatternCard } from '@/components/patterns/PatternCard';
const PricingCards = dynamic(() => import('@/components/monetization/PricingCards').then(m => ({ default: m.PricingCards })), { ssr: false });
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { allSiddhis, SIDDHI_COUNT } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { BreathTimer } from '@/components/practice/BreathTimer';
import { ResonanceToggle } from '@/components/ui/ResonanceToggle';
import { useIsMobile } from '@/hooks/use-mobile';

export default function HomePage() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const featured = allSiddhis.slice(0, 3);
  const patternPreview = allPatterns.slice(0, 4);

  return (
    <div className="bg-deep-black">
      {/* ===== CHAMBER I: ARRIVAL — Hero with Video Background ===== */}
      <section className="relative min-h-[100svh] md:h-[120vh] flex items-end overflow-hidden">
        {/* Video background — desktop only, poster-only on mobile (saves 1.2 MB) */}
        {!isMobile ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            poster={`https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-temple-midnight`}
            className="hero-video-bg absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 0, objectPosition: 'center' }}
          >
            <source src="https://res.cloudinary.com/b9oo5abp/video/upload/q_auto/kalki-mirror/hero-kalki-avatar-riding.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              zIndex: 0,
              backgroundImage: 'url(https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_640,c_limit/kalki-mirror/home/ancient-temple-midnight)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        {/* Dark scrim ABOVE video, BELOW text */}
        <div className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.65) 40%, rgba(5,5,5,0.82) 100%)',
          }}
        />
        {/* Extra top darkness for nav readability */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-deep-black/60 to-transparent z-[2] pointer-events-none" />

        {/* Centered brand lockup — positioned against the hero, not the CTA stack */}
        <div className="hero-brand-lockup" aria-label="KALKI-TANTRA, The Gate Beyond Shambhala">
            <span className="hero-brand-name">KALKI-TANTRA</span>
            <span className="hero-brand-subtitle">The Gate Beyond Shambhala</span>
        </div>

        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 hero-content-safe">
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
                  fontSize: 'clamp(3.5rem, 10vw, 8rem)',
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
            className="hero-actions flex flex-wrap gap-4 mt-4"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/archive" className="gold-cta">Akashic</Link>
            <Link href="/practice" className="ghost-cta">Tantra</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CINEMATIC STRIP I — Cave yantras (with parallax) ===== */}
      <ScrollParallax speed={-0.2} disabled={isMobile} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/stone-gateway-ancient-forest"
          alt="Ancient stone gateway in forest with rudraksha mala, copper pot, and ritual trident — the entrance to practice"
          kenBurns={isMobile ? 'none' : 'normal'}
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ===== CHAMBER II: THE TWO DOORS — Asymmetric split (with parallax) ===== */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[70vh] md:min-h-[85vh]">
        {/* Archive Door — YANTRA Decoded */}
        <ScrollParallax speed={-0.1} disabled={isMobile}>
          <Link href="/archive" className="group relative overflow-hidden block min-h-[70vh] md:min-h-[85vh]">
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/manuscript-sacred-geometry"
              alt="Cave with ancient yantra inscriptions and golden butter lamps — the repository of knowledge"
              kenBurns={isMobile ? 'none' : 'normal'}
              scrim="bottom"
              volumetric
              dust
            />
            <div className="scrim-bottom-anchored" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
              <p className="section-label mb-4">YANTRA Decoded</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 hero-heading tracking-wide">
                {SIDDHI_COUNT} Siddhis.{' '}
                <span style={{ display: 'block' }}>Mapped.</span>
              </h2>
              <p className="text-foreground text-base max-w-md editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>
                Decoded by YANTRA. Every mantra, every lineage, every warning.
              </p>
            </div>
          </Link>
        </ScrollParallax>

        {/* Practice Door — Sadhana Instruments */}
        <ScrollParallax speed={0.1} disabled={isMobile}>
          <Link href="/practice" className="group relative overflow-hidden block min-h-[70vh] md:min-h-[85vh]">
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-walking-mountain-path"
              alt="Ascetic walking barefoot on a golden-hour Himalayan mountain path toward a distant temple — the path of practice"
              kenBurns={isMobile ? 'none' : 'normal'}
              scrim="bottom"
              volumetric
              dust
            />
            <div className="scrim-bottom-anchored" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8 md:p-12 lg:p-16">
              <p className="section-label mb-4">Sadhana Instruments</p>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-white leading-[0.95] mb-3 hero-heading tracking-wide">
                See Yourself.{' '}
                <span style={{ display: 'block' }}>Clearly.</span>
              </h2>
              <p className="text-foreground text-base max-w-md editorial-spacing" style={{textShadow: '0 1px 8px rgba(0,0,0,0.7)'}}>
                Breathwork, japa, meditation — guided tools for inner work.
              </p>
            </div>
          </Link>
        </ScrollParallax>
      </section>

      {/* ===== EDITORIAL BAND — What KALKI Is ===== */
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-20">
        <p className="text-text-muted text-sm max-w-3xl mx-auto editorial-spacing leading-relaxed text-center">
          KALKI is a precision instrument for inner transformation — not a marketplace of generic
          spirituality content. Every practice in the Akashic Archive is sourced from recognized Tantric
          texts, scored for authenticity, and linked to the specific psychological pattern it was designed
          to address. The system draws from the Upaniṣads, Tantras, Āgamas, Haṭha Yoga Pradīpikā, and
          living practitioner lineages across the Aghorī, Kashmiri Shaiva, and Vajrayāna traditions.
        </p>
        <p className="text-text-muted text-sm max-w-3xl mx-auto editorial-spacing leading-relaxed text-center mt-6">
          Unlike aggregation platforms that flatten tradition into listicles, KALKI preserves the
          internal architecture of each practice — the prerequisite sādhanas, the contraindications,
          the specific lineage variations. The Archive contains 48 siddhis mapped across six evidence
          categories, from primary textual attestation to living practitioner testimony, each scored
          for authenticity on a transparent 0–100 scale. This is not wellness content. This is a
          functioning diagnostic system built from the grammar of an unbroken tradition.
        </p>
      </div>

      {/* ===== CHAMBER III: EDITORIAL DIVIDER — The Mirror Method (with parallax text) ===== */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-28 md:py-40">
        <div className="divider-gold mb-20" />
        <ParallaxText speed={-0.06} className="max-w-3xl mx-auto text-center">
          <p className="section-label mb-8">The Mirror Method</p>
          <p className="text-sub-display text-foreground mb-8 engraved-heading">
            Your patterns{' '}
            <span style={{ display: 'block' }}>have names.</span>
          </p>
          <p className="text-editorial max-w-xl mx-auto">
            Every emotional loop, every recurring relationship dynamic — they map
            to ancient sādhanas designed for exactly this. The KALKI system identifies
            twelve core patterns drawn from the Aghorī, Kashmiri Shaiva, and Buddhist
            Vajrayāna traditions, each one linked to specific siddhis and prescribed
            practices from the living Tantric lineage. The framework is not derived
            from modern psychology alone — it is a translation grid between behavioral
            observation and the Tantric science of saṃskāra (mental impressions),
            showing how patterns form, persist, and can be dissolved through precise
            practice.
          </p>
        </ParallaxText>
        <div className="divider-gold mt-20" />
      </div>

      {/* ===== CINEMATIC STRIP II — Sri Yantra sky (with parallax) ===== */}
      <ScrollParallax speed={-0.2} disabled={isMobile} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/sri-yantra-himalayas"
          alt="Sri Yantra floating above Himalayan peaks at twilight"
          kenBurns={isMobile ? 'none' : 'normal'}
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ===== CHAMBER IV: PATTERN ATLAS — Museum grid (with parallax) ===== */}
      <section className="relative py-20 md:py-32 section-scrim-dim">
        <ScrollParallax speed={-0.12} disabled={isMobile}>
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
            alt="Empty ancient stone ashram interior with firelight and smoke — the space where patterns are revealed"
            scrim="full"
            vignette
            className="absolute inset-0"
          />
        </ScrollParallax>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.p
className="section-label editorial-heading mb-6"
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

      {/* ===== CHAMBER V: FEATURED SIDDHIS — Dark museum hall (with parallax) ===== */}
      <section className="relative py-28 md:py-40">
        <ScrollParallax speed={-0.1} disabled={isMobile}>
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
            alt="Ancient stone ashram interior — the repository of forbidden tantric knowledge"
            scrim="full"
            vignette
            dust
          />
        </ScrollParallax>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.p
            className="section-label editorial-heading mb-8"
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
            <Link href="/archive" className="ghost-cta text-sm">Browse All {SIDDHI_COUNT} Siddhis</Link>
          </motion.div>
        </div>
      </section>

      {/* ===== CINEMATIC STRIP III — Underground library (with parallax) ===== */}
      <ScrollParallax speed={-0.2} disabled={isMobile} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior"
          alt="Vast underground library of ancient manuscripts and golden artifacts"
          kenBurns={isMobile ? 'none' : 'normal'}
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ===== CHAMBER VI: BREATH — Two-column layout with Nadi Shuddhi image (with parallax image) ===== */}
      <section className="relative py-20 md:py-28 lg:py-32 bg-deep-black">
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="practice-layout grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
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
              <div className="flex items-center gap-6 flex-wrap mb-12">
                <ResonanceToggle />
              </div>
              <motion.div
                initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <BreathTimer patternSlug="nadi-shuddhi-basic" />
              </motion.div>
            </div>

            {/* RIGHT COLUMN — image, gold-framed, with parallax depth */}
            <ScrollParallax speed={-0.08} disabled={isMobile} className="relative">
              <div className="relative rounded-lg overflow-hidden aspect-[16/10]"
                style={{
                  border: '1px solid rgba(212,175,55,0.3)',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(212,175,55,0.06)',
                }}
              >
                <CinematicImage
                  src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-water-practice"
                  alt="Ascetic performing water ritual at Himalayan ghat steps with copper pot and rudraksha — Nadi Shuddhi channel purification"
                />
              </div>
            </ScrollParallax>
          </div>
        </div>
      </section>

      {/* ===== CHAMBER VII: MEMBERSHIP — New background with heavy dim ===== */}
      <section className="relative py-28 md:py-40">
        {/* New background image — copper trident courtyard */}
        <ScrollParallax speed={-0.06} disabled={isMobile}>
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-ash-fire-contemplation"
            alt="Rudraksha, copper vessel, ash and fire — the earth element grounding of tantric practice"
            className="absolute inset-0"
          />
        </ScrollParallax>
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
              Four paths.{' '}
              <span style={{ display: 'block' }}>One purpose.</span>
            </h2>
          </motion.div>
          <PricingCards />
        </div>
      </section>

      {/* ===== CINEMATIC STRIP IV — Observatory (with parallax) ===== */}
      <ScrollParallax speed={-0.2} disabled={isMobile} className="cinematic-strip">
        <CinematicImage
          src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ascetic-himalayan-overlook"
          alt="Ascetic performing smoke ritual at twilight overlooking Himalayan valleys — the water element of expansion"
          kenBurns={isMobile ? 'none' : 'normal'}
          filmGrain={false}
        />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* ===== CHAMBER VIII: CONSULT THE ARCHIVIST CTA BAND (with parallax bg) ===== */}
      <section className="relative py-28 md:py-40 safe-bottom">
        {/* New background — ancient temple midnight glow */}
        <ScrollParallax speed={-0.08} disabled={isMobile}>
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-temple-midnight"
            alt="Ancient temple at midnight with ethereal golden glow — the inner sanctum"
            className="absolute inset-0"
          />
        </ScrollParallax>
        {/* Bottom-anchored scrim — strengthened mid-section for body text contrast */}
        <div className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background: 'linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.75) 100%)',
          }}
        />
        <ParallaxText speed={-0.05} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">
            Enter the Inner Sanctum
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-8 hero-heading tracking-wide">
            The Archive Awaits.
          </h2>
          <p
            className="text-foreground text-lg mb-12 editorial-spacing"
            style={{textShadow: '0 1px 8px rgba(0,0,0,0.6)'}}
          >
            Kaustubh is a Tantric Technologist — part technologist, part
            practitioner, part pattern-recognizer. He maps your recurring
            behavioral loops to specific siddhis and sadhanas from the
            Akashic Archive, prescribing exact practices for your exact pattern.
            No guesswork. No generic advice. Just precise, lineage-backed
            intervention designed for where you are right now.
          </p>
          <p className="text-text-muted text-sm max-w-lg mx-auto mb-12 editorial-spacing leading-relaxed">
            Each consultation begins with the Mirror Method diagnostic — identifying your
            dominant karmic loop through behavioral pattern analysis — and culminates in a
            prescribed sādhana drawn directly from the Archive. Sessions are conducted via
            WhatsApp video call and include follow-up practice review.
          </p>
          <div>
            <WhatsAppCTA variant="inline" label="Consult Kaustubh" />
          </div>
        </ParallaxText>
      </section>
    </div>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'KALKI — Tantrik Intelligence',
          description: 'Precision instrument for inner transformation. 48 siddhis from the Akashic Archive, 12 emotional patterns mapped to specific tantric practices, and the Mirror Method framework for pattern dissolution.',
          url: 'https://www.astrokalki.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.astrokalki.com/archive?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        }),
      }}
    />
  );
}
