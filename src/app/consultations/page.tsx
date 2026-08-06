'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { BackButton } from '@/components/nav/BackButton';
import { consultationServices } from '@/lib/data/consultations';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

const KAUSTUBH_IMG = 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_800,c_limit/kalki-mirror/kaustubh-portrait';

export default function ConsultationsPage() {
  const reduced = useReducedMotion();
  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-ritual-chamber-alt'
        title="Consult the Archivist"
        subtitle="Structured sessions bridging the ancient map and your lived experience. Not fortune-telling — pattern intelligence."
        sectionLabel="With Kaustubh"
      />

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 md:py-28">
        <BackButton href="/" label="Back to Home" className="mb-12" />

        {/* === THE ARCHIVIST — Portrait + Bio === */}
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
              <div className="relative neon-glow-white rounded-sm overflow-hidden border border-gold/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={KAUSTUBH_IMG}
                  alt="Kaustubh — Tantric Technologist & Founder of KALKI"
                  className="w-full h-auto object-cover"
                  loading="eager"
                  decoding="sync"
                  draggable={false}
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

        <div className="divider-gold mb-20" />

        {/* === SESSIONS === */}
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
      </div>
    </div>
  );
}
