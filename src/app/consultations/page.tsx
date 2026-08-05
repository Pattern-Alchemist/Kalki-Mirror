'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { consultationServices } from '@/lib/data/consultations';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

export default function ConsultationsPage() {
  const reduced = useReducedMotion();
  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/tantra/hero-fire.jpeg"
        title="Consultations"
        subtitle="Personal sessions bridging the ancient map and your lived experience."
        sectionLabel="With Kaustubh"
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 md:py-28">
        <motion.p className="text-editorial mb-20 max-w-2xl"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true }}
        >
          These are not fortune-telling sessions. They are structured conversations
          where Kaustubh helps you identify your recurring emotional patterns and
          connects them to specific sādhana practices designed for transformation.
        </motion.p>

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
                    <span className="text-[0.6rem] bg-gold/15 text-gold px-2.5 py-1 rounded-full tracking-wider uppercase">Most Chosen</span>
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
