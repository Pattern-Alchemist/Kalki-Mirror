'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import type { Archetype } from '@/lib/data/archetypes';
import { AuthenticityMeter } from '@/components/archive/AuthenticityMeter';
import { CautionBadge, getCautionLevel } from '@/components/archive/CautionBadge';
import dynamic from 'next/dynamic';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import { TIER_LABELS } from '@/lib/utils/tier-gate';
import { siddhiCategoryLabel } from '@/lib/data/tantra-categories';
import { BackButton } from '@/components/nav/BackButton';
import { TermText } from '@/components/longform/TermText';
import { track } from '@/lib/analytics/track';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax, ParallaxText } from '@/components/ui/ScrollParallax';
import { fadeInUp } from '@/lib/motion/tokens';
import { WHATSAPP_LINKS } from '@/lib/utils/whatsapp';
import type { Siddhi, Tier, Pattern } from '@/lib/data/types';

const AcknowledgmentGate = dynamic(() => import('@/components/archive/AcknowledgmentGate').then(m => ({ default: m.AcknowledgmentGate })), { ssr: false, loading: () => <div className="min-h-[200px]" /> });
const GatedContent = dynamic(() => import('@/components/monetization/GatedContent').then(m => ({ default: m.GatedContent })), { ssr: false, loading: () => <div className="min-h-[100px]" /> });

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const color = confidence === 'high' ? 'text-green-400 border-green-400/20 bg-green-400/8' :
    confidence === 'medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/8' :
      'text-red-400 border-red-400/20 bg-red-400/8';
  return <span className={`text-[0.8125rem] px-2.5 py-1 rounded-sm border tracking-wider uppercase ${color}`}>{confidence}</span>;
}

export default function SiddhiFolioClient({ siddhi, relatedSiddhis, relatedPatterns, activeArchetype }: {
  siddhi: Siddhi;
  relatedSiddhis: Siddhi[];
  relatedPatterns: Pattern[];
  activeArchetype?: Archetype;
}) {
  useEffect(() => { track('folio_viewed', { slug: siddhi.slug }); }, [siddhi.slug]);
  const reduced = useNativeReducedMotion();

  const caution = getCautionLevel(siddhi.level);
  const requiresAcknowledgment = caution === 'HIGH' || caution === 'SEALED';
  const isSealed = caution === 'SEALED';

  return (
    <div className="bg-deep-black min-h-screen">
      {/* Atmospheric header */}
      <header className="border-b border-gold/5">
        <div className="w-full max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
          <BackButton href="/archive" label="Back to Archive" className="mb-8" />
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <motion.p 
              className="font-mono text-[0.8125rem] tracking-[0.2em] uppercase text-copper" 
              initial={reduced ? { opacity: 1 } : fadeInUp.hidden} 
              animate={fadeInUp.visible}
            >
              [ {siddhiCategoryLabel(siddhi.category).toUpperCase()} / {siddhi.tradition.toUpperCase()} ]
            </motion.p>
            <CautionBadge level={caution} />
          </div>
          <motion.h1 
            className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-3 engraved-heading font-light"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden} 
            animate={fadeInUp.visible} 
            transition={{ delay: 0.1 }}
          >
            {siddhi.name}
          </motion.h1>
          <motion.p className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-8" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.15 }}>
            {siddhi.sanskrit}
          </motion.p>
          <motion.div className="flex flex-wrap gap-3" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} transition={{ delay: 0.2 }}>
            <span className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-gold tracking-[0.15em] uppercase">{siddhi.level}</span>
            <span className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-text-secondary tracking-[0.15em] uppercase">{TIER_LABELS[siddhi.minTier as Tier]} TIER</span>
            {activeArchetype && (
              <Link 
                href={`/archetypes#${activeArchetype.id}`} 
                className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-copper tracking-[0.15em] uppercase hover:text-gold hover:border-gold/30 transition-colors duration-500"
              >
                {activeArchetype.name}
              </Link>
            )}
          </motion.div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 space-y-24 pb-32">
        <AcknowledgmentGate title={siddhi.name} cautionLevel={siddhi.level}>
          {/* Authenticity */}
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <p className="section-label mb-4">Authenticity</p>
            <AuthenticityMeter score={siddhi.authenticityScore} />
          </motion.section>

          <div className="divider-subtle" />

          {/* Overview */}
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <p className="section-label mb-6">Overview</p>
            <p className="text-editorial"><TermText text={siddhi.summary} /></p>
          </motion.section>

          {/* Archetype connection */}
          {activeArchetype && (
            <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-6">Archetype Classification</p>
              <div className="glass-chip p-8">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <Link href={`/archetypes#${activeArchetype.id}`} className="group">
                      <p className="font-display text-2xl text-foreground group-hover:text-gold transition-colors duration-500 font-light mb-2">
                        {activeArchetype.name}
                      </p>
                      <p className="font-mono text-[0.8125rem] text-gold-dim tracking-[0.12em] mb-4">
                        {activeArchetype.sanskrit}
                      </p>
                    </Link>
                    <p className="text-editorial">{activeArchetype.pattern}</p>
                  </div>
                  <div className="shrink-0">
                    <div className="w-24 h-24 rounded-sm overflow-hidden border border-gold/10 relative">
                      <CinematicImage src={activeArchetype.image} alt={activeArchetype.name} fill={false} width={96} height={96} filmGrain={false} vignette />
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

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
            <p className="section-label mb-6">Significance</p>
            <GatedContent minTier={siddhi.minTier}>
              <ul className="space-y-4">
                {siddhi.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-4 text-text-secondary">
                    <span className="text-gold mt-1">{'\u00B7'}</span><span className="editorial-spacing">{b}</span>
                  </li>
                ))}
              </ul>
            </GatedContent>
          </motion.section>

          {/* Warnings */}
          <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
            <p className="section-label mb-6" style={{ color: 'var(--crimson)' }}>Warnings</p>
            <div className="glass-chip p-8" style={{ borderColor: 'rgba(138, 37, 44, 0.2)' }}>
              <ul className="space-y-3">
                {siddhi.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(138, 37, 44, 0.85)' }}>
                    <span className="mt-0.5" style={{ color: 'var(--crimson)' }}>{'\u00B7'}</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>

          {/* Contraindications */}
          {siddhi.contraindications && siddhi.contraindications.length > 0 && (
            <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-6" style={{ color: 'var(--amber, #d97706)' }}>Contraindications</p>
              <div className="glass-chip p-8" style={{ borderColor: 'rgba(217, 119, 6, 0.2)' }}>
                <p className="text-xs text-text-muted mb-4 font-mono tracking-wider uppercase">Medical &amp; psychological conditions requiring caution</p>
                <ul className="space-y-3">
                  {siddhi.contraindications.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(217, 119, 6, 0.9)' }}>
                      <span className="mt-0.5 shrink-0" style={{ color: 'var(--amber, #d97706)' }}>{'\u26A0'}</span><span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.section>
          )}

          {/* Parallax Interlude */}
          <ScrollParallax speed={-0.1} className="-mx-6 lg:-mx-10">
            <div className="relative h-[35vh] md:h-[40vh] overflow-hidden">
              <CinematicImage src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/archetypes/temple-silhouette" alt="Ancient temple silhouette" fill scrim="full" vignette filmGrain={false} />
            </div>
          </ScrollParallax>

          {/* Evidence Sources */}
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

          {/* Integrations */}
          {siddhi.integrations && siddhi.integrations.length > 0 && (
            <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-6">Practice Integrations</p>
              <div className="space-y-3">
                {siddhi.integrations.map((integ, i) => (
                  <div key={i} className="glass-chip p-4 flex items-start gap-3">
                    <span className="mt-0.5 shrink-0 text-copper">{'\u2197'}</span>
                    <p className="text-sm text-text-secondary">{integ}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Practice Variants */}
          {siddhi.variantPractices && siddhi.variantPractices.length > 0 && (
            <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-6">Practice Variants</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {siddhi.variantPractices.map((vp, i) => (
                  <div key={i} className="glass-chip p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-display text-lg text-foreground font-light">{vp.name}</p>
                      <span className="glass-chip px-3 py-1 font-mono text-[0.75rem] text-gold tracking-[0.15em] uppercase">{vp.level}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{vp.description}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Connected Patterns */}
          {relatedPatterns.length > 0 && (
            <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-8">Mirror Method Connections</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {relatedPatterns.map((p) => (
                  <Link key={p.slug} href={`/patterns/${p.slug}`} className="glass-chip p-5 group">
                    <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors duration-500">{p.name}</p>
                    <p className="text-xs text-text-muted mt-1 italic">{p.subtitle}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* Related Siddhis */}
          {relatedSiddhis.length > 0 && (
            <motion.section initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <p className="section-label mb-8">Related in the Archive</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedSiddhis.map((s) => (
                  <Link key={s.slug} href={`/archive/${s.slug}`} className="glass-chip p-5 group">
                    <p className="font-display text-lg text-foreground group-hover:text-gold transition-colors duration-500 mb-1 font-light">{s.name}</p>
                    <p className="font-mono text-[0.75rem] tracking-[0.15em] uppercase text-copper">{s.level}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}

          {/* CTA */}
          {!isSealed && (
            <motion.div className="text-center pt-12" initial={reduced ? { opacity: 1 } : fadeInUp.hidden} whileInView={fadeInUp.visible} viewport={{ once: true }}>
              <WhatsAppCTA variant="inline" message={WHATSAPP_LINKS.siddhi(siddhi.name)} label="Consult the Archivist" />
            </motion.div>
          )}
        </AcknowledgmentGate>
      </div>

      {/* Cinematic Strip */}
      <ScrollParallax speed={-0.15} className="cinematic-strip">
        <CinematicImage src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/' alt='Meditation platform' kenBurns="normal" filmGrain={false} />
        <div className="cinematic-strip-overlay" />
      </ScrollParallax>

      {/* Closing CTA */}
      <section className="relative py-24 md:py-36">
        <ScrollParallax speed={-0.06} disabled>
          <CinematicImage src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/home/ancient-stone-ashram-interior' alt='Ashram interior' className="absolute inset-0" scrim="full" vignette />
        </ScrollParallax>
        <div className="absolute inset-0 pointer-events-none z-[1] cta-overlay-dark" />
        <ParallaxText speed={-0.04} className="relative z-10 max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">Continue the Investigation</p>
          <h2 className="font-display text-3xl md:text-5xl text-white mb-6 hero-heading tracking-wide">
            The pattern is mapped.{' '}<span style={{ display: 'block' }}>The sādhana awaits.</span>
          </h2>
          <p className="text-foreground/70 text-lg mb-12 editorial-spacing text-shadow-deep">
            Book a session with Kaustubh for a precise prescription — or explore the Archive and Library to continue your own investigation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <WhatsAppCTA variant="inline" label="Consult the Archivist" />
            <Link href="/patterns" className="ghost-cta">Pattern Atlas</Link>
          </div>
        </ParallaxText>
      </section>
    </div>
  );
}
