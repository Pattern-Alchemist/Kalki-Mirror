'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { BackButton } from '@/components/nav/BackButton';
import { consultationServices } from '@/lib/data/consultations';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { submitConsultation } from './actions';
import { ConsultationScreener } from '@/components/ai/ConsultationScreener';

const KAUSTUBH_IMG = 'https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_800,c_limit/kalki-mirror/kaustubh-portrait';

interface ConsultationForm {
  name: string;
  whatsapp: string;
  message: string;
  photoBase64: string;
}

export default function ConsultationsPage() {
  const reduced = useReducedMotion();
  const [form, setForm] = useState<ConsultationForm>({ name: '', whatsapp: '', message: '', photoBase64: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, photoBase64: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }, []);
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

        <div className="divider-gold my-20" />

        {/* === CONSULTATION REQUEST FORM === */}
        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-xl mx-auto"
        >
          {submitted ? (
            <div className="glass-panel p-10 text-center">
              <p className="section-label mb-4">Request Received</p>
              <p className="font-display text-2xl text-white mb-4">The Archive acknowledges you.</p>
              <p className="text-text-secondary text-sm editorial-spacing">
                Kaustubh will respond via WhatsApp within 24 hours.
              </p>
            </div>
          ) : (
            <div className="glass-panel p-8 md:p-10">
              <p className="section-label mb-6">Request a Consultation</p>

              {/* AI Pre-Screening Analysis */}
              {form.name && form.message.length >= 10 && (
                <div className="mb-8">
                  <ConsultationScreener name={form.name} message={form.message} />
                </div>
              )}

              {/* Photo upload */}
              <div className="flex flex-col items-center mb-8">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-16 h-16 rounded-full border border-zinc-700 bg-zinc-800 overflow-hidden cursor-pointer transition-all duration-300 hover:border-gold/40 hover:ring-2 hover:ring-gold/10 focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                  aria-label={form.photoBase64 ? 'Change photo' : 'Add your photo'}
                >
                  {form.photoBase64 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={form.photoBase64}
                      alt="Your photo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-zinc-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  aria-hidden="true"
                />
                <span className="mt-2 text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted">
                  {form.photoBase64 ? 'Change Photo' : 'Add Photo'}
                </span>
              </div>

              {/* Form fields */}
              <div className="space-y-5">
                <div>
                  <label htmlFor="consult-name" className="block text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted mb-2">Name</label>
                  <input
                    id="consult-name"
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-transparent border border-zinc-700 rounded-sm px-4 py-3 text-foreground text-sm placeholder:text-zinc-600 focus:border-gold/40 focus:outline-none transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="consult-whatsapp" className="block text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted mb-2">WhatsApp Number</label>
                  <input
                    id="consult-whatsapp"
                    type="tel"
                    value={form.whatsapp}
                    onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                    className="w-full bg-transparent border border-zinc-700 rounded-sm px-4 py-3 text-foreground text-sm placeholder:text-zinc-600 focus:border-gold/40 focus:outline-none transition-colors"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label htmlFor="consult-message" className="block text-[0.6875rem] tracking-[0.2em] uppercase text-text-muted mb-2">Your Pattern</label>
                  <textarea
                    id="consult-message"
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full bg-transparent border border-zinc-700 rounded-sm px-4 py-3 text-foreground text-sm placeholder:text-zinc-600 focus:border-gold/40 focus:outline-none transition-colors resize-none"
                    placeholder="Describe what you're navigating — relationships, career, inner blocks..."
                  />
                </div>
              </div>

              {formError && (
                <p className="text-red-400 text-xs mt-4 text-center">{formError}</p>
              )}
              <button
                type="button"
                onClick={async () => {
                  setFormError('');
                  setSubmitting(true);
                  const result = await submitConsultation({
                    name: form.name,
                    whatsapp: form.whatsapp,
                    message: form.message,
                  });
                  setSubmitting(false);
                  if (result.success) {
                    setSubmitted(true);
                  } else {
                    setFormError(result.error || 'Submission failed.');
                  }
                }}
                disabled={!form.name || !form.whatsapp || submitting}
                className="gold-cta w-full mt-8"
              >
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
