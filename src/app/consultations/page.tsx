'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { BackButton } from '@/components/nav/BackButton';
import { consultationServices } from '@/lib/data/consultations';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import dynamic from 'next/dynamic';

const ConsultationWizard = dynamic(() => import('@/components/consultations/ConsultationWizard'), { ssr: false, loading: () => <div className="h-64" /> });

const KAUSTUBH_IMG = 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_800,c_limit/kalki-mirror/kaustubh-portrait';

/* ─── Main Page ─── */

export default function ConsultationsPage() {
  const reduced = useNativeReducedMotion();

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ═══════ CINEMATIC HERO ═══════ */}
      <section className="relative min-h-[90vh] md:min-h-[100vh] overflow-hidden">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/consult/contemplation-hero'
          alt="Contemplative figure in sacred space — consult the archivist"
          fill
          kenBurns='slow'
          scrim='bottom'
          vignette
          volumetric
          dust
          priority
        />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40" />
        <div className="absolute inset-0 flex items-end pb-20 md:pb-28 z-10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
            <p className="section-label mb-4">WITH KAUSTUBH</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white font-light tracking-wide hero-heading">
              Consult the Archivist
            </h1>
          </div>
        </div>
      </section>

      {/* ═══════ ATMOSPHERIC TRANSITION ═══════ */}
      <div className="atmospheric-bg h-24 -mt-10 relative z-10" />

      {/* ═══════ THE ARCHIVIST — Portrait + Bio ═══════ */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">
        <BackButton href="/" label="Back to Home" className="mb-12" />

        <motion.div
          className="relative grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 mb-28"
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Portrait — with dramatic gold-framed glow */}
          <div className="md:col-span-2 flex justify-center md:justify-start">
            <div className="relative max-w-xs w-full">
              <div className="absolute -inset-1 bg-gradient-to-b from-gold/30 via-gold/10 to-transparent rounded-sm blur-sm" />
              <div className="relative neon-glow-white rounded-sm overflow-hidden border border-gold/20 aspect-[3/4]">
                <CinematicImage
                  src={KAUSTUBH_IMG}
                  alt="Kaustubh — Tantric Technologist & Founder of KALKI"
                  fill
                  priority
                  filmGrain={false}
                />
                {/* Gold corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-gold/60" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-gold/60" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-gold/60" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-gold/60" />
              </div>
            </div>
          </div>

          {/* Bio — impressive words */}
          <div className="md:col-span-3 flex flex-col justify-center">
            <p className="section-label mb-6">The Architect Behind the Mirror</p>
            <h2 className="font-display text-3xl md:text-4xl text-white font-light tracking-wide mb-6 hero-heading">
              Kaustubh
            </h2>
            <p className="font-mono text-sm text-gold tracking-[0.15em] uppercase mb-8">
              Tantric Technologist &middot; Pattern Intelligence Architect
            </p>
            <div className="space-y-5 text-text-secondary text-base leading-relaxed editorial-spacing">
              <p>
                Kaustubh is the creator of <span className="text-foreground font-medium">YANTRA</span> — a computational
                intelligence system that decodes human behavioral patterns through the lens of Tantric
                psychology and the ten Mahāvidyā archetypes. He didn't study these patterns in a
                classroom. He mapped them from the inside out — through years of disciplined sādhana,
                direct experience with lineage teachers, and a relentless empirical approach to the
                inner sciences.
              </p>
              <p>
                His work bridges the gap between ancient <span className="text-foreground font-medium">Akashic mapping</span> — the
                codified science of karma, siddhi, and transformation — and the modern practitioner
                who needs clarity, not mystification. Every session is a precision instrument: no
                astrology, no fortune-telling, no performative spirituality. Just the architecture
                of your patterns, laid bare, with exact prescriptions for transformation.
              </p>
              <p>
                Discreet. Professional. Sovereign. Kaustubh holds the Archive not as a guru,
                but as an <span className="text-gold">archivist</span> — a keeper of maps
                that exist whether anyone reads them or not.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ═══════ EDITORIAL DIVIDER — ParallaxText ═══════ */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-24 md:py-36">
          <div className="divider-gold mb-16" />
          <ParallaxText speed={-0.05} className="max-w-3xl mx-auto text-center">
            <p className="text-sub-display text-foreground mb-6 engraved-heading">
              Not fortune-telling.{' '}
            <span style={{ display: 'block' }}>Pattern intelligence.</span>
            </p>
          </ParallaxText>
          <div className="divider-gold mt-16" />
        </div>

        {/* ═══════ PARALLAX INTERLUDE ═══════ */}
        <ScrollParallax speed={-0.1} className="mb-20">
          <div className="cinematic-strip relative h-[30vh] md:h-[40vh] overflow-hidden">
            <CinematicImage
              src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/consult/contemplation-hero"
              alt="Ritual chamber — the space between"
              fill
              scrim="full"
              vignette
              filmGrain={false}
            />
          </div>
        </ScrollParallax>

        {/* ── EDITORIAL: What to Expect ── */}
        <div className="max-w-2xl mb-16 space-y-4 text-text-secondary text-sm leading-relaxed editorial-spacing">
          <h3 className="font-display text-xl text-foreground mb-4">What to Expect</h3>
          <p>
            A KALKI consultation is not a generic astrology reading. The session begins with Kaustubh analyzing your birth chart to identify the dominant planetary influences on your psychological patterns — not to predict events, but to map the <em>saṃskāras</em> (impressions) that shape your reactive tendencies. This chart analysis is cross-referenced with the KALKI pattern database to identify which of the 16 archetypes and 20 behavioral patterns are most active in your current life phase.
          </p>
          <p>
            The second phase of the consultation focuses on the Mirror Method: you will be guided through a structured self-inquiry process to verify whether the patterns identified in the chart match your lived experience. This is crucial — the chart shows potential; your experience confirms reality. Where they align, a prescription is formulated: specific siddhis, breathwork patterns, and practice sequences designed to address the identified loop. The prescription is not generic — it is calibrated to your dominant archetype, your available practice time, and your current level of experience.
          </p>
          <p>
            Sessions are conducted over WhatsApp video call. No preparation is required beyond knowing your exact time, date, and place of birth. After the session, you receive a written dossier accessible in the KALKI app that includes the full pattern diagnosis, your prescribed sādhana arc, and progress-tracking tools. Follow-up sessions review your practice data and adjust the prescription as your patterns evolve.
          </p>
        </div>

        {/* ═══════ SESSIONS ═══════ */}
        <motion.div className="space-y-6"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {consultationServices.map((service) => (
            <motion.div key={service.slug} variants={staggerItem}
              className={`glass-panel p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 ${
                service.popular ? 'border-gold' : ''
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-display text-xl text-foreground">{service.name}</h3>
                  {service.popular && (
                    <span className="text-[0.8125rem] bg-gold/15 text-gold px-2.5 py-1 rounded-full tracking-wider uppercase">Most Chosen</span>
                  )}
                </div>
                <p className="text-caption mb-3">{service.duration} &middot; {service.price}</p>
                <p className="text-text-secondary text-sm leading-relaxed">{service.description}</p>
              </div>
              <WhatsAppCTA
                variant="inline"
                message={service.whatsappPrefill}
                label={`Book ${service.name}`}
                className="shrink-0"
              />
            </motion.div>
          ))}
        </motion.div>

        <div className="divider-gold my-20" />

        {/* ═══════ CONSULTATION INTAKE WIZARD ═══════ */}
        <div className="relative -mx-6 lg:-mx-10 px-6 lg:px-10 py-16 md:py-24 overflow-hidden">
          {/* Cinematic form background — sacred ashram interior */}
          <div className="absolute inset-0 z-0 opacity-10" aria-hidden="true">
            <CinematicImage
              cloudinaryId="kalki-mirror/consult/form-bg"
              alt=""
              fill
              filmGrain={false}
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-deep-black via-deep-black/60 to-deep-black" aria-hidden="true" />
          <div className="relative z-10">
            <ConsultationWizard />
          </div>
        </div>
      </div>

      {/* ═══════ CLOSING CTA ═══════ */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage
            src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior'
            alt="Ancient stone ashram interior — the repository of forbidden tantric knowledge"
            className="absolute inset-0"
            scrim="full"
            vignette
          />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1] cta-overlay-dark" />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">The Archive is Open</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The map exists.{' '}
            <span style={{ display: 'block' }}>The archivist is here.</span>
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing">Book a session directly via WhatsApp. No intermediary. No scheduling platform. Just you and the pattern.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" label="Message on WhatsApp" />
            <Link href="/patterns" className="ghost-cta">Explore Patterns</Link>
          </div>
        </ParallaxText>
      </section>

      {/* ═══════ BINDU PULSE FOOTER ═══════ */}
      <div className="relative pb-28 md:pb-20 mt-16">
        <div className="atmospheric-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 text-center">
          <div className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-gold/40 rounded-full bindu-pulse" />
          </div>
          <p className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper">
            CONSULTATIONS — THE ARCHIVIST
          </p>
        </div>
      </div>
    </div>
  );
}
