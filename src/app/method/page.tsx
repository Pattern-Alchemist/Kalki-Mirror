'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { MirrorMethodSteps } from '@/components/patterns/MirrorMethodSteps';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp } from '@/lib/motion/tokens';

export default function MethodPage() {
  const reduced = useReducedMotion();
  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/research/labyrinth.jpg"
        title="The Mirror Method"
        subtitle="A five-stage framework for recognizing and dissolving your psychological patterns through ancient sādhana."
        sectionLabel="Our Framework"
      />

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-24">
        {/* The Five Steps */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-3">Five Stages</p>
          <h2 className="font-display text-3xl mb-10">The Path of Recognition</h2>
          <MirrorMethodSteps />
        </motion.section>

        {/* Stage Details */}
        {[
          { num: 1, title: 'Pattern Recognition', text: 'The first step is naming the loop. Every recurring frustration, every self-sabotaging decision, every relationship that ends the same way — these are not random. They are patterns with names, origins, and specific sādhanas designed to address them. AstroKalki maps 12 core psychological patterns to specific tantric practices.' },
          { num: 2, title: 'Emotional Origin', text: 'Every pattern started somewhere. Not as a flaw, but as a survival strategy. The Rescuer pattern formed because love felt conditional on being useful. The Perfectionist formed because safety meant never making a mistake. Understanding the origin dissolves shame and replaces it with clarity.' },
          { num: 3, title: 'Karmic Reinforcement', text: 'Patterns persist because they are reinforced by karma — not in the mystical sense, but in the neurological sense. Each repetition strengthens the neural pathway. Each time you choose the familiar pain over the unknown growth, you deepen the groove. The sādhanas are designed to create new grooves.' },
          { num: 4, title: 'Behavioral Expression', text: 'Patterns do not stay in the mind. They express through behavior: the way you speak, the relationships you choose, the work you avoid, the anger you swallow. Observing these expressions without judgment is itself a practice — and it is the gateway to change.' },
          { num: 5, title: 'Conscious Intervention', text: 'This is where the ancient meets the personal. With awareness of the pattern, its origin, its reinforcement, and its expression, you can now choose a different response. The specific sādhana prescribed for your pattern becomes the tool of intervention — not as an escape, but as a disciplined practice of rewiring.' },
        ].map((stage) => (
          <motion.section key={stage.num} className="border-l-2 border-gold-dim pl-8"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <p className="section-label mb-2">Stage {stage.num}</p>
            <h3 className="font-display text-2xl mb-4">{stage.title}</h3>
            <p className="text-text-secondary leading-relaxed">{stage.text}</p>
          </motion.section>
        ))}

        <motion.div className="text-center pt-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <WhatsAppCTA variant="inline" label="Begin With a Conversation" />
        </motion.div>
      </div>
    </div>
  );
}