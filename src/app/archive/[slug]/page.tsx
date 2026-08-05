'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { AuthenticityMeter } from '@/components/archive/AuthenticityMeter';
import { GatedContent } from '@/components/monetization/GatedContent';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import { fadeInUp } from '@/lib/motion/tokens';
import { WHATSAPP_LINKS } from '@/lib/utils/whatsapp';
import type { Tier } from '@/lib/data/types';

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const color = confidence === 'high' ? 'text-green-400 border-green-400/20 bg-green-400/8' :
    confidence === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/8' :
      'text-red-400 border-red-400/20 bg-red-400/8';
  return <span className={`text-[0.6rem] px-2.5 py-1 rounded-sm border tracking-wider uppercase ${color}`}>{confidence}</span>;
}

export default function SiddhiFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const siddhi = getSiddhiBySlug(slug);
  if (!siddhi) notFound();
  const reduced = useReducedMotion();

  const related = allSiddhis.filter((s) => s.slug !== siddhi.slug && s.category === siddhi.category).slice(0, 3);
  const relPatterns = allPatterns.filter((p) => p.relatedSiddhis.includes(siddhi.slug)).slice(0, 2);

  return (
    <div className="bg-deep-black min-h-screen">
      {/* Atmospheric header */}
      <header className="border-b border-gold/5">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
          {/* Metadata tags — JetBrains Mono terminal aesthetic */}
          <motion.p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-copper mb-6" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible}>
            [ {siddhi.category.toUpperCase()} / {siddhi.tradition.toUpperCase()} ]
          </motion.p>
          <motion.h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-3 engraved-heading font-light"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.1 }}>
            {siddhi.name}
          </motion.h1>
          <motion.p className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.15 }}>
            {siddhi.sanskrit}
          </motion.p>
          <motion.div className="flex flex-wrap gap-3" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.2 }}>
            <span className="glass-chip px-4 py-1.5 font-mono text-[0.6rem] text-gold tracking-[0.15em] uppercase">{siddhi.level}</span>
            <span className="glass-chip px-4 py-1.5 font-mono text-[0.6rem] text-text-secondary tracking-[0.15em] uppercase">{TIER_LABELS[siddhi.minTier as Tier]} TIER</span>
          </motion.div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 space-y-24 pb-32">
        {/* Authenticity */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="text-caption mb-4">Authenticity</p>
          <AuthenticityMeter score={siddhi.authenticityScore} />
        </motion.section>

        <div className="divider-subtle" />

        {/* Summary */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6">Overview</p>
          <p className="text-editorial">{siddhi.summary}</p>
        </motion.section>

        {/* Mantra */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6">Primary Mantra</p>
          <GatedContent minTier={siddhi.minTier}>
            <p className="font-display text-2xl md:text-3xl text-gold leading-relaxed p-8 glass-panel">
              {siddhi.primaryMantra}
            </p>
          </GatedContent>
        </motion.section>

        {/* Lineage */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6">Lineage</p>
          <GatedContent minTier={siddhi.minTier}>
            <p className="text-editorial">{siddhi.lineage}</p>
          </GatedContent>
        </motion.section>

        {/* Benefits */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6">Benefits</p>
          <GatedContent minTier={siddhi.minTier}>
            <ul className="space-y-4">
              {siddhi.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-4 text-text-secondary">
                  <span className="text-gold mt-1">&middot;</span><span className="editorial-spacing">{b}</span>
                </li>
              ))}
            </ul>
          </GatedContent>
        </motion.section>

        {/* Warnings - ALWAYS visible */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6" style={{ color: 'var(--crimson)' }}>Warnings</p>
          <div className="glass-chip p-8" style={{ borderColor: 'rgba(138, 37, 44, 0.2)' }}>
            <ul className="space-y-3">
              {siddhi.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(138, 37, 44, 0.85)' }}>
                  <span className="mt-0.5" style={{ color: 'var(--crimson)' }}>&middot;</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* Evidence */}
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="section-label mb-6">Evidence Sources ({siddhi.evidenceCount})</p>
          <div className="space-y-4">
            {siddhi.evidenceSources.map((src, i) => (
              <div key={i} className="glass-chip p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <ConfidenceBadge confidence={src.confidence} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{src.title}</p>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-dim hover:text-gold truncate block max-w-md transition-colors duration-500">
                      {src.url}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Related Siddhis */}
        {related.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <p className="section-label mb-8">Related Siddhis</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((s) => (
                <Link key={s.slug} href={`/archive/${s.slug}`} className="glass-chip p-5 group">
                  <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors duration-500 mb-1 font-light">{s.name}</p>
                  <p className="font-mono text-[0.55rem] tracking-[0.15em] uppercase text-copper">{s.level}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Mirror Method Connections */}
        {relPatterns.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <p className="section-label mb-8">Mirror Method Connections</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {relPatterns.map((p) => (
                <Link key={p.slug} href={`/patterns/${p.slug}`} className="glass-chip p-5 group">
                  <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors duration-500">{p.name}</p>
                  <p className="text-xs text-text-muted mt-1 italic">{p.subtitle}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.div className="text-center pt-12" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <WhatsAppCTA variant="inline" message={WHATSAPP_LINKS.siddhi(siddhi.name)} label="Consult the Archivist" />
        </motion.div>
      </div>
    </div>
  );
}