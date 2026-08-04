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
import { useTier } from '@/components/layout/TierProvider';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import { fadeInUp } from '@/lib/motion/tokens';
import { WHATSAPP_LINKS } from '@/lib/utils/whatsapp';
import { Tier } from '@/lib/data/types';

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const color = confidence === 'high' ? 'text-green-400 border-green-400/30 bg-green-400/10' :
    confidence === 'medium' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' :
      'text-red-400 border-red-400/30 bg-red-400/10';
  return <span className={`text-xs px-2 py-0.5 rounded border ${color}`}>{confidence}</span>;
}

export default function SiddhiFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const siddhi = getSiddhiBySlug(slug);
  if (!siddhi) notFound();
  const reduced = useReducedMotion();
  const { canAccess } = useTier();

  const related = allSiddhis.filter((s) => s.slug !== siddhi.slug && s.category === siddhi.category).slice(0, 3);
  const relPatterns = allPatterns.filter((p) => p.relatedSiddhis.includes(siddhi.slug)).slice(0, 2);

  return (
    <div className="bg-deep-black min-h-screen">
      <header className="max-w-4xl mx-auto px-6 pt-24 pb-8">
        <motion.p className="section-label mb-4" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible}>
          {siddhi.category} · {siddhi.tradition}
        </motion.p>
        <motion.h1 className="font-display text-4xl md:text-5xl mb-2" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.1 }}>
          {siddhi.name}
        </motion.h1>
        <motion.p className="text-text-muted text-lg mb-6" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.15 }}>
          {siddhi.sanskrit}
        </motion.p>
        <motion.div className="flex flex-wrap gap-3 mb-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.2 }}>
          <span className="glass-chip px-3 py-1 text-xs text-gold">{siddhi.level}</span>
          <span className="glass-chip px-3 py-1 text-xs text-text-secondary">{TIER_LABELS[siddhi.minTier as Tier]} tier</span>
        </motion.div>
        <motion.div className="mb-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.25 }}>
          <p className="text-text-muted text-xs uppercase tracking-wider mb-2">Authenticity</p>
          <AuthenticityMeter score={siddhi.authenticityScore} />
        </motion.div>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-16 pb-32">
        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <p className="text-text-secondary text-lg leading-relaxed">{siddhi.summary}</p>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Primary Mantra</h2>
          <GatedContent minTier={siddhi.minTier}>
            <p className="font-display text-2xl text-gold leading-relaxed p-6 bg-surface rounded border border-gold-subtle">
              {siddhi.primaryMantra}
            </p>
          </GatedContent>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Lineage</h2>
          <GatedContent minTier={siddhi.minTier}>
            <p className="text-text-secondary leading-relaxed">{siddhi.lineage}</p>
          </GatedContent>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Benefits</h2>
          <GatedContent minTier={siddhi.minTier}>
            <ul className="space-y-3">
              {siddhi.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-text-secondary">
                  <span className="text-gold mt-1">·</span>{b}
                </li>
              ))}
            </ul>
          </GatedContent>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4 text-red-400">Warnings</h2>
          <div className="bg-red-950/20 border border-red-900/30 rounded p-6">
            <ul className="space-y-3">
              {siddhi.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-red-300/80">
                  <span className="text-red-400 mt-0.5">⚠</span>{w}
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <h2 className="section-label mb-4">Evidence Sources ({siddhi.evidenceCount})</h2>
          <div className="space-y-4">
            {siddhi.evidenceSources.map((src, i) => (
              <div key={i} className="glass-chip p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <ConfidenceBadge confidence={src.confidence} />
                <div className="flex-1">
                  <p className="text-sm text-foreground">{src.title}</p>
                  {src.url && (
                    <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-dim hover:text-gold truncate block max-w-md">
                      {src.url}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {related.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <h2 className="section-label mb-6">Related Siddhis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((s) => (
                <Link key={s.slug} href={`/archive/${s.slug}`} className="glass-chip p-4 hover:border-gold transition-colors group">
                  <p className="text-sm text-foreground group-hover:text-gold transition-colors">{s.name}</p>
                  <p className="text-xs text-text-muted mt-1">{s.level}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {relPatterns.length > 0 && (
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <h2 className="section-label mb-6">Mirror Method Connections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relPatterns.map((p) => (
                <Link key={p.slug} href={`/patterns/${p.slug}`} className="glass-chip p-4 hover:border-gold transition-colors group">
                  <p className="text-sm text-foreground group-hover:text-gold transition-colors">{p.name}</p>
                  <p className="text-xs text-text-muted mt-1">{p.subtitle}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        <motion.section className="text-center pt-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
          <WhatsAppCTA variant="inline" message={WHATSAPP_LINKS.siddhi(siddhi.name)} label="Discuss with Kaustubh" />
        </motion.section>
      </div>
    </div>
  );
}