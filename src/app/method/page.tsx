'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import { MirrorMethodSteps } from '@/components/patterns/MirrorMethodSteps';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { BackButton } from '@/components/nav/BackButton';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

const stages = [
  { num: 1, title: 'Pattern Recognition', text: 'The first step is naming the loop. Every recurring frustration, every self-sabotaging decision, every relationship that ends the same way — these are not random. They are patterns with names, origins, and specific sādhanas designed to address them. KALKI maps 12 core psychological patterns to specific tantric practices.' },
  { num: 2, title: 'Emotional Origin', text: 'Every pattern started somewhere. Not as a flaw, but as a survival strategy. The Rescuer pattern formed because love felt conditional on being useful. The Perfectionist formed because safety meant never making a mistake. Understanding the origin dissolves shame and replaces it with clarity.' },
  { num: 3, title: 'Karmic Reinforcement', text: 'Patterns persist because they are reinforced by karma — not in the mystical sense, but in the neurological sense. Each repetition strengthens the neural pathway. Each time you choose the familiar pain over the unknown growth, you deepen the groove. The sādhanas are designed to create new grooves.' },
  { num: 4, title: 'Behavioral Expression', text: 'Patterns do not stay in the mind. They express through behavior: the way you speak, the relationships you choose, the work you avoid, the anger you swallow. Observing these expressions without judgment is itself a practice — and it is the gateway to change.' },
  { num: 5, title: 'Conscious Intervention', text: 'This is where the ancient meets the personal. With awareness of the pattern, its origin, its reinforcement, and its expression, you can now choose a different response. The specific sādhana prescribed for your pattern becomes the tool of intervention — not as an escape, but as a disciplined practice of rewiring.' },
];

export default function MethodPage() {
  const reduced = useReducedMotion();
  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-cremation-ground-alt'
        title="The Mirror Method"
        subtitle="A five-stage framework for recognizing and dissolving your psychological patterns through ancient sādhana."
        sectionLabel="The Architecture"
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 md:py-28 space-y-28">
        <BackButton href="/" label="Back to Home" />

        {/* The Five Steps — Visual Overview */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Five Stages</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-12 engraved-heading">The Path of Recognition</h2>
          <MirrorMethodSteps />
        </motion.section>

        {/* ── Cinematic Divider ── */}
        <ScrollParallax speed={-0.08}>
          <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-observatory-alt'
              alt="The architecture of recognition"
              kenBurns="slow"
              scrim="full"
              vignette
              fog
            />
          </div>
        </ScrollParallax>

        {/* Stage Details — Timeline with Gold Numbers */}
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[27px] md:left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-gold/10 to-transparent" aria-hidden="true" />

          {stages.map((stage, idx) => (
            <motion.div
              key={stage.num}
              className="relative pl-16 md:pl-20 pb-20 last:pb-0"
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
              whileInView={fadeInUp.visible}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: reduced ? 0 : idx * 0.06 }}
            >
              {/* Gold step number — metallic circle on the timeline */}
              <div className="absolute left-0 top-1 w-14 h-14 md:w-[4.5rem] md:h-[4.5rem]">
                <motion.div
                  className={cn(
                    'w-full h-full rounded-full flex items-center justify-center',
                    'border-2 border-gold/40 bg-deep-black',
                    'shadow-[0_0_20px_rgba(212,175,55,0.08),inset_0_0_12px_rgba(212,175,55,0.05)]'
                  )}
                  initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : 0.15 + idx * 0.06 }}
                >
                  <span className="font-display text-2xl md:text-3xl text-gold font-light">
                    {stage.num}
                  </span>
                </motion.div>
                {/* Active dot on the timeline */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gold/60 -z-10" />
              </div>

              <p className="text-caption mb-3 text-gold-dim">Stage {stage.num}</p>
              <h3 className="font-display text-2xl md:text-3xl text-foreground mb-5 engraved-heading">{stage.title}</h3>
              <p className="text-editorial max-w-2xl">{stage.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center pt-12" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <WhatsAppCTA variant="inline" label="Begin With a Conversation" />
        </motion.div>
      </div>
    </div>
  );
}
