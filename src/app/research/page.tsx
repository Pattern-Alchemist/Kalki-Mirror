'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PageHero } from '@/components/layout/PageHero';
import { allSiddhis } from '@/lib/data/siddhis';
import { BackButton } from '@/components/nav/BackButton';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { BookOpen, Landmark, GraduationCap, Flame, PenTool, Cpu, Scale, FileCheck, Eye, ShieldCheck, ChevronRight } from 'lucide-react';

export default function ResearchPage() {
  const reduced = useReducedMotion();
  const totalEvidence = allSiddhis.reduce((sum, s) => sum + s.evidenceCount, 0);
  const avgAuth = Math.round(allSiddhis.reduce((sum, s) => sum + s.authenticityScore, 0) / allSiddhis.length);
  const traditions = [...new Set(allSiddhis.map((s) => s.tradition))];

  return (
    <div className="bg-deep-black min-h-screen">
      <PageHero
        image='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-observatory-alt'
        title="Research & Sources"
        subtitle="Epistemic transparency: every claim sourced, every score explained."
        sectionLabel="Epistemic Rigour"
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28 space-y-28">
        <BackButton href="/" label="Back to Home" className="mb-10" />

        {/* ── Stats ── */}
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {[
            { label: 'Siddhis Catalogued', value: 41, suffix: '' },
            { label: 'Evidence Sources', value: totalEvidence, suffix: '' },
            { label: 'Average Authenticity', value: avgAuth, suffix: '%' },
          ].map((stat) => (
            <motion.div key={stat.label} variants={staggerItem} className="glass-panel p-8 md:p-10 text-center">
              <p className="font-display text-4xl md:text-5xl text-gold mb-3 text-glow-subtle">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-caption">{stat.label}</p>
            </motion.div>
          ))}
        </motion.section>

        {/* ── Visual Divider: Gold Line ── */}
        <div className="divider-gold" />

        {/* ═══════════════════════════════════════════════════
            EPISTEMIC FRAMEWORK — Six Evidence Categories
           ═══════════════════════════════════════════════════ */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Epistemic Transparency</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 engraved-heading">Six Evidence Categories</h2>
          <p className="text-text-muted text-sm max-w-2xl mb-12 editorial-spacing">
            Every siddhi in the Archive is tagged with one or more evidence categories. These are not hierarchical — they describe the nature of the source, not its rank. A practitioner testimony can be as valuable as a textual attestation, depending on the question being asked.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'Traditional Source', desc: 'Direct from scriptural or oral tradition — Upaniṣads, Tantras, Āgamas, and lineages with traceable transmission.', icon: BookOpen, accent: 'gold' },
              { name: 'Historical Evidence', desc: 'Verified through historical records, epigraphy, and archaeological correlation.', icon: Landmark, accent: 'bronze' },
              { name: 'Academic Research', desc: 'Peer-reviewed publications, scholarly analysis, and cross-disciplinary academic work.', icon: GraduationCap, accent: 'ivory' },
              { name: 'Experiential Tradition', desc: 'Living practitioner lineages and verified testimonies from contemporary sādhakas.', icon: Flame, accent: 'copper' },
              { name: 'Editorial Synthesis', desc: 'KALKI editorial team cross-referenced analysis, clearly flagged as interpretive.', icon: PenTool, accent: 'gold-dim' },
              { name: 'AI Interpretation', desc: 'Machine-generated connections and pattern recognition, always flagged as non-traditional.', icon: Cpu, accent: 'granite' },
            ].map((cat) => {
              const IconComp = cat.icon;
              return (
                <motion.div
                  key={cat.name}
                  className="glass-chip p-6 flex gap-4 group hover:border-gold/15 transition-colors duration-500"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="shrink-0 w-11 h-11 rounded-sm flex items-center justify-center border border-gold/10 group-hover:border-gold/25 transition-colors duration-500" style={{ backgroundColor: `var(--${cat.accent})`, opacity: 0.08 }}>
                    <IconComp className="w-5 h-5" style={{ color: `var(--${cat.accent})`, opacity: 0.7 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground mb-1.5 font-display text-lg">{cat.name}</p>
                    <p className="text-xs text-text-muted editorial-spacing leading-relaxed">{cat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ── Cinematic Divider ── */}
        <ScrollParallax speed={-0.08}>
          <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
            <CinematicImage
              src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-dark-temple-interior'
              alt="Ancient texts and observatory instruments"
              kenBurns="slow"
              scrim="full"
              vignette
              fog
            />
          </div>
        </ScrollParallax>

        {/* ── Visual Divider ── */}
        <div className="divider-gold" />

        {/* ═══════════════════════════════════════════════════
            TRADITIONS REPRESENTED
           ═══════════════════════════════════════════════════ */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Coverage</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 engraved-heading">Traditions Represented</h2>
          <p className="text-text-muted text-sm max-w-2xl mb-10 editorial-spacing">
            The Archive draws from multiple darśanas and lineages. Each tradition contributes a distinct epistemic lens — some emphasize textual precision, others emphasize direct experience. We preserve both.
          </p>
          <div className="flex flex-wrap gap-3">
            {traditions.map((t, i) => (
              <motion.span
                key={t}
                className="glass-chip px-5 py-2.5 text-sm text-text-secondary hover:text-gold hover:border-gold/20 transition-colors duration-500 inline-flex items-center gap-2"
                initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <ChevronRight className="w-3 h-3 text-gold/40" />
                {t}
              </motion.span>
            ))}
          </div>
        </motion.section>

        {/* ── Visual Divider ── */}
        <div className="divider-subtle" />

        {/* ═══════════════════════════════════════════════════
            AUTHENTICITY METHODOLOGY — Rich Visual Layout
           ═══════════════════════════════════════════════════ */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-4">Methodology</p>
          <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 engraved-heading">How We Score Authenticity</h2>
          <p className="text-text-muted text-sm max-w-2xl mb-14 editorial-spacing">
            Authenticity is not a single judgment — it is a composite of three measurable dimensions. Each siddhi receives a score from 0 to 100, calculated from weighted factors that reflect different forms of epistemic support.
          </p>

          {/* ── Three Scoring Pillars ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                label: 'Textual Attestation',
                weight: '40%',
                desc: 'How many primary and secondary sources reference the practice. Upaniṣads and Tantras carry the highest weight; commentaries and modern interpretations carry less.',
                icon: FileCheck,
              },
              {
                label: 'Lineage Continuity',
                weight: '35%',
                desc: 'Whether the practice has an unbroken living tradition — from documented historical lineages to verified contemporary practitioners who report results consistent with textual descriptions.',
                icon: ShieldCheck,
              },
              {
                label: 'Experiential Verification',
                weight: '25%',
                desc: 'Whether contemporary practitioners report results consistent with traditional descriptions. This is the most subjective factor, so it receives the lowest weight.',
                icon: Eye,
              },
            ].map((pillar, i) => {
              const IconComp = pillar.icon;
              return (
                <motion.div
                  key={pillar.label}
                  className="glass-panel p-8 relative group hover:border-gold/15 transition-colors duration-500"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Weight badge */}
                  <div className="absolute top-6 right-6 font-mono text-[0.65rem] tracking-[0.15em] px-2.5 py-1 border border-gold/20" style={{ color: 'var(--gold)' }}>
                    {pillar.weight}
                  </div>
                  <div className="w-10 h-10 rounded-sm bg-gold/5 border border-gold/10 flex items-center justify-center mb-5">
                    <IconComp className="w-5 h-5 text-gold/50" />
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-3">{pillar.label}</h3>
                  <p className="text-xs text-text-muted editorial-spacing leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>

          {/* ── Source Confidence Tiers ── */}
          <div className="divider-subtle mb-14" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <motion.div
              className="glass-chip p-6 border-l-2"
              style={{ borderLeftColor: 'var(--gold)' }}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[0.65rem] tracking-[0.15em] mb-2" style={{ color: 'var(--gold)' }}>HIGH CONFIDENCE</p>
              <p className="text-sm text-foreground font-medium mb-2">Primary Textual References</p>
              <p className="text-xs text-text-muted editorial-spacing leading-relaxed">
                Upaniṣads, Tantras, Āgamas — the root textual corpus of the tradition. These carry the highest epistemic weight in our scoring model.
              </p>
            </motion.div>

            <motion.div
              className="glass-chip p-6 border-l-2"
              style={{ borderLeftColor: 'var(--bronze)' }}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[0.65rem] tracking-[0.15em] mb-2" style={{ color: 'var(--bronze)' }}>MEDIUM CONFIDENCE</p>
              <p className="text-sm text-foreground font-medium mb-2">Secondary Scholarship</p>
              <p className="text-xs text-text-muted editorial-spacing leading-relaxed">
                Commentaries, historical records, and academic scholarship that interpret or reference primary sources. Valuable, but interpretive.
              </p>
            </motion.div>

            <motion.div
              className="glass-chip p-6 border-l-2"
              style={{ borderLeftColor: 'var(--copper)' }}
              initial={reduced ? { opacity: 1 } : { opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[0.65rem] tracking-[0.15em] mb-2" style={{ color: 'var(--copper)' }}>LOW CONFIDENCE</p>
              <p className="text-sm text-foreground font-medium mb-2">Oral & Modern Interpretations</p>
              <p className="text-xs text-text-muted editorial-spacing leading-relaxed">
                Oral traditions without textual corroboration, or modern reinterpretations without traditional grounding. Included for transparency, scored accordingly.
              </p>
            </motion.div>
          </div>

          {/* ── Editorial Integrity Statement ── */}
          <motion.div
            className="glass-panel p-8 md:p-10 max-w-3xl"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-sm bg-gold/5 border border-gold/10 flex items-center justify-center mt-1">
                <Scale className="w-5 h-5 text-gold/50" />
              </div>
              <div>
                <p className="text-caption mb-3 text-gold-dim">EDITORIAL INTEGRITY</p>
                <p className="text-sm text-text-secondary leading-relaxed editorial-spacing">
                  We never blur the distinction between traditional knowledge and our editorial interpretation. When KALKI synthesizes or connects material, it is flagged as editorial synthesis, not traditional source. The AI interpretation category exists specifically to ensure that machine-generated connections are never mistaken for scriptural authority. This is the epistemic boundary that makes the Archive trustworthy.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
