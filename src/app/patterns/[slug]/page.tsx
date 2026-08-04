'client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { fadeInUp } from '@/lib/motion/tokens';

export default function PatternFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const pattern = allPatterns.find((p) => p.slug === slug);
  if (!pattern) notFound();
  const reduced = useReducedMotion();
  const relatedSiddhis = allSiddhis.filter((s) => pattern.relatedSiddhis.includes(s.slug)).slice(0, 3);

  return (
    <div className="bg-deep-black min-h-screen">
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-8">
        <motion.p className="section-label mb-4" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible}>
          The Mirror Method
        </motion.p>
        <motion.h1 className="font-display text-4xl md:text-5xl mb-2" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.1 }}>
          {pattern.name}
        </motion.h1>
        <motion.p className="text-gold-dim text-lg mb-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.15 }}>
          {pattern.subtitle}
        </motion.p>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-16 pb-32">
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Overview</h2>
          <p className="text-text-secondary text-lg leading-relaxed">{pattern.description}</p>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-6">Recognizing This Pattern</h2>
          <div className="space-y-4">
            {pattern.signs.map((sign, i) => (
              <div key={i} className="glass-chip p-4 flex items-start gap-4">
                <span className="text-gold font-display text-lg">{i + 1}</span>
                <p className="text-text-secondary">{sign}</p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Origin</h2>
          <p className="text-text-secondary leading-relaxed">{pattern.origin}</p>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Suggested Practice</h2>
          <p className="text-text-secondary leading-relaxed">{pattern.practice}</p>
        </motion.section>

        {relatedSiddhis.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <h2 className="section-label mb-6">Connected Siddhis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedSiddhis.map((s) => (
                <Link key={s.slug} href={`/archive/${s.slug}`} className="glass-chip p-4 hover:border-gold transition-colors group">
                  <p className="text-sm text-foreground group-hover:text-gold transition-colors">{s.name}</p>
                  <p className="text-xs text-text-muted mt-1">{s.level}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        <motion.div className="text-center pt-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <WhatsAppCTA variant="inline" label="Discuss Your Pattern" />
        </motion.div>
      </div>
    </div>
  );
}