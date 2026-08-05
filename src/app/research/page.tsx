'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { allSiddhis } from '@/lib/data/siddhis';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

export default function ResearchPage() {
  const reduced = useReducedMotion();
  const totalEvidence = allSiddhis.reduce((sum, s) => sum + s.evidenceCount, 0);
  const avgAuth = Math.round(allSiddhis.reduce((sum, s) => sum + s.authenticityScore, 0) / allSiddhis.length);
  const traditions = [...new Set(allSiddhis.map((s) => s.tradition))];

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image="/assets/tantra/kali-temple.jpeg"
        title="Research & Sources"
        subtitle="Epistemic transparency: every claim sourced, every score explained."
        sectionLabel="Epistemic Rigour"
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28 space-y-28">
        {/* Stats */}
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {[
            { label: 'Siddhis Catalogued', value: '41' },
            { label: 'Evidence Sources', value: String(totalEvidence) },
            { label: 'Average Authenticity', value: `${avgAuth}%` },
          ].map((stat) => (
            <motion.div key={stat.label} variants={staggerItem} className="glass-panel p-8 md:p-10 text-center">
              <p className="font-display text-4xl md:text-5xl text-gold mb-3 text-glow-subtle">{stat.value}</p>
              <p className="text-caption">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* Epistemic Framework */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Epistemic Transparency</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-12 engraved-heading">Six Evidence Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'Traditional Source', desc: 'Direct from scriptural or oral tradition' },
              { name: 'Historical Evidence', desc: 'Verified through historical records and archaeology' },
              { name: 'Academic Research', desc: 'Peer-reviewed publications and scholarly analysis' },
              { name: 'Experiential Tradition', desc: 'Living practitioner lineages and testimonies' },
              { name: 'Editorial Synthesis', desc: 'KALKI editorial team cross-referenced analysis' },
              { name: 'AI Interpretation', desc: 'Machine-generated connections flagged as such' },
            ].map((cat) => (
              <div key={cat.name} className="glass-chip p-6">
                <p className="text-sm text-foreground mb-2 font-display text-lg">{cat.name}</p>
                <p className="text-xs text-text-muted editorial-spacing">{cat.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Traditions covered */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <div className="divider-subtle mb-16" />
          <p className="section-label mb-4">Coverage</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-10 engraved-heading">Traditions Represented</h2>
          <div className="flex flex-wrap gap-3">
            {traditions.map((t) => (
              <span key={t} className="glass-chip px-5 py-2.5 text-sm text-text-secondary">{t}</span>
            ))}
          </div>
        </motion.section>

        {/* Authenticity methodology */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <div className="divider-subtle mb-16" />
          <p className="section-label mb-4">Methodology</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-10 engraved-heading">How We Score Authenticity</h2>
          <div className="space-y-6 text-editorial max-w-3xl">
            <p>Each siddhi receives an authenticity score from 0 to 100, calculated from three weighted factors: textual attestation (how many primary and secondary sources reference the practice), lineage continuity (whether the practice has an unbroken living tradition), and experiential verification (whether contemporary practitioners report results consistent with traditional descriptions).</p>
            <p>Sources are individually rated as high, medium, or low confidence. High-confidence sources are primary textual references (Upaniṣads, Tantras, Āgamas). Medium-confidence sources are secondary scholarship, commentaries, or historical records. Low-confidence sources are oral traditions without textual corroboration or modern reinterpretations without traditional grounding.</p>
            <p>We never blur the distinction between traditional knowledge and our editorial interpretation. When KALKI synthesizes or connects material, it is flagged as editorial synthesis, not traditional source.</p>
          </div>
        </motion.section>
      </div>
    </div>
  );
}