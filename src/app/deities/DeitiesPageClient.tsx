'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { ShieldAlert, ShieldCheck, ShieldBan, Link as LinkIcon, Flame, Zap } from 'lucide-react';
import { BackButton } from '@/components/nav/BackButton';
import { CinematicImage } from '@/components/ui/CinematicImage';
import { ScrollParallax } from '@/components/ui/ScrollParallax';
import dynamic from 'next/dynamic';
import { TIER_BADGE_STYLES } from '@/lib/utils/tier-gate';
import { ALL_ARCHETYPES, CAUTION_LABELS, type CautionLevel } from '@/lib/data/archetypes';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const GatedContent = dynamic(() => import('@/components/monetization/GatedContent').then(m => ({ default: m.GatedContent })), { ssr: false, loading: () => <div className="min-h-[100px]" /> });

/* ── Caution badge styles ── */
const CAUTION_STYLES: Record<CautionLevel, string> = {
  OPEN: 'bg-foreground/5 text-text-secondary border-foreground/10',
  MODERATE: 'bg-[#8a7230]/10 text-[#d4a853] border-[#8a7230]/25',
  HIGH: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/25',
  SEALED: 'bg-foreground/10 text-text-muted border-foreground/20',
};

const CAUTION_ICONS: Record<CautionLevel, typeof ShieldCheck> = {
  OPEN: ShieldCheck,
  MODERATE: ShieldCheck,
  HIGH: ShieldAlert,
  SEALED: ShieldBan,
};

/* ── Derived data for each archetype ── */
interface ArchetypeStats {
  relatedSiddhiCount: number;
  relatedPatternCount: number;
}

function getArchetypeStats(id: string): ArchetypeStats {
  const archetype = ALL_ARCHETYPES.find((a) => a.id === id);
  if (!archetype) return { relatedSiddhiCount: 0, relatedPatternCount: 0 };
  return {
    relatedSiddhiCount: archetype.relatedSiddhiSlugs.length,
    relatedPatternCount: archetype.relatedPatternSlugs.length,
  };
}

/* ══════════════════════════════════════════════════════════════
   DEITY CARD
   ══════════════════════════════════════════════════════════════ */
function DeityCard({
  archetype,
  index,
}: {
  archetype: typeof ALL_ARCHETYPES[number];
  index: number;
}) {
  const reduced = useNativeReducedMotion();
  const stats = getArchetypeStats(archetype.id);
  const CautionIcon = CAUTION_ICONS[archetype.cautionLevel];
  const isHighOrSealed = archetype.cautionLevel === 'HIGH' || archetype.cautionLevel === 'SEALED';

  return (
    <motion.div
      variants={staggerItem}
      className="glass-panel overflow-hidden group"
    >
      {/* ── Image ── */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        <CinematicImage
          src={archetype.image}
          alt={archetype.name}
          scrim="bottom"
          vignette
          className="!absolute inset-0 w-full h-full"
        />
        {/* Number overlay */}
        <span className="absolute top-3 left-3 font-mono text-[0.6rem] tracking-[0.3em] text-white/30 z-10">
          {String(archetype.number).padStart(2, '0')}
        </span>
        {/* Caution badge */}
        <span className={cn(
          'absolute top-3 right-3 inline-flex items-center gap-1 text-[0.55rem] font-mono tracking-[0.15em] uppercase px-2 py-0.5 rounded-sm border z-10',
          CAUTION_STYLES[archetype.cautionLevel]
        )}>
          <CautionIcon className="w-3 h-3" />
          {CAUTION_LABELS[archetype.cautionLevel]}
        </span>
      </div>

      {/* ── Content ── */}
      <div className="p-5 md:p-6">
        {/* Name row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-display text-xl text-foreground gold-foil-text leading-tight">
            {archetype.name}
          </h3>
          <Link
            href={`/archetypes#${archetype.id}`}
            className="shrink-0 mt-1 text-text-muted/30 hover:text-gold transition-colors"
            aria-label={`View ${archetype.name} archetype detail`}
          >
            <LinkIcon className="w-4 h-4" />
          </Link>
        </div>

        {/* Sanskrit */}
        {archetype.sanskrit && (
          <p className="text-gold/50 text-sm mb-3">{archetype.sanskrit}</p>
        )}

        {/* Element + Bīja row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="glass-chip text-[0.6rem] font-mono tracking-wider">
            {archetype.element}
          </span>
          {isHighOrSealed ? (
            <GatedContent
              minTier={archetype.accessTier}
              label="Bīja Mantra"
              teaser={`The seed syllable for ${archetype.name} requires ${archetype.accessTier} access.`}
            >
              <span className="glass-chip text-[0.6rem] font-mono tracking-wider text-gold-dim">
                <Flame className="w-3 h-3 inline mr-1" />
                {archetype.bija}
              </span>
            </GatedContent>
          ) : (
            <span className="glass-chip text-[0.6rem] font-mono tracking-wider text-gold-dim">
              {archetype.bija}
            </span>
          )}
        </div>

        {/* Pattern (one-liner) */}
        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {archetype.pattern}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-foreground/5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-gold/40" />
            <span className="font-mono text-[0.6rem] tracking-wider text-text-muted/60">
              {stats.relatedSiddhiCount} {stats.relatedSiddhiCount === 1 ? 'siddhi' : 'siddhis'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-gold/40" />
            <span className="font-mono text-[0.6rem] tracking-wider text-text-muted/60">
              {stats.relatedPatternCount} {stats.relatedPatternCount === 1 ? 'pattern' : 'patterns'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════
   THE PANTHEON — Main Page
   ══════════════════════════════════════════════════════════════ */
export default function DeitiesPageClient() {
  const reduced = useNativeReducedMotion();

  const mahavidyas = useMemo(() => ALL_ARCHETYPES.slice(0, 10), []);
  const supplementary = useMemo(() => ALL_ARCHETYPES.slice(10), []);

  return (
    <div className="bg-deep-black min-h-screen">
      {/* ── Cinematic Hero ── */}
      <header className="relative min-h-[90vh] md:min-h-[100vh] flex items-end overflow-hidden">
        <CinematicImage
          src='https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/temple-midnight'
          alt="Dark temple interior lit by oil lamps"
          kenBurns="slow"
          scrim="bottom"
          vignette
          volumetric
          dust
          priority
        />
        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28 pt-32">
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            ARCHETYPE COMPENDIUM
          </motion.p>
          <motion.h1
            className={cn(
              'font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading'
            )}
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.1, duration: 0.8 }}
          >
            The Pantheon
          </motion.h1>
          <motion.p
            className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            16 archetypal forces. Each governing a karmic loop.
          </motion.p>
        </div>
      </header>

      {/* ── Atmospheric gradient ── */}
      <div className="atmospheric-bg h-64 -mt-24 relative z-10" />

      {/* ── Stats Bar ── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-10 -mt-4 mb-12">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">10</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Mahāvidyās</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">6</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Supplementary</p>
          </div>
          <div className="bg-foreground/5 border border-foreground/10 rounded-lg p-5 text-center">
            <p className="font-display text-3xl md:text-4xl text-gold font-light">16</p>
            <p className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-foreground/40 mt-1">Total Archetypes</p>
          </div>
        </div>
      </div>

      {/* ── EDITORIAL: What Are Archetypes? ── */}
      <div className="max-w-3xl mx-auto px-6 lg:px-10 mt-8 mb-8">
        <div className="space-y-4 text-text-secondary text-sm leading-relaxed editorial-spacing">
          <p>
            In the KALKI framework, archetypes are not abstract psychological constructs — they are <em>structural forces</em> that organize human experience into repeating patterns. The concept draws from the Tantric understanding of <em>devatā</em> (deity as a form of consciousness) combined with the modern psychological insight that humans tend to cluster around predictable behavioral loops. Each archetype in this compendium maps a specific loop: the pattern that keeps you trapped, the mechanism by which it sustains itself, and the sādhana (structured practice) that can dissolve it.
          </p>
          <p>
            The term "karmic loop" is used deliberately. In Buddhist psychology, <em>kleśa</em> (afflictive mental states) create repetitive patterns of perception and reaction — the same situation triggers the same response, which produces the same suffering, which reinforces the pattern. The Tantric approach does not seek to suppress these loops but to <em>enter</em> them fully, experience their structure from the inside, and dissolve them through direct awareness. Each archetype provides a complete topology: the trigger, the emotional signature, the cognitive distortion it produces, the siddhis (practices) that address it, and the related behavioral patterns it connects to.
          </p>
          <p>
            The caution levels — Open, Moderate, High, and Sealed — indicate not the danger of the archetype itself but the depth of psychological material it accesses. High-caution archetypes (Kālī, Tārā, Chinnamastā, Bhairavī, Bagalāmukhī) deal with ego-dissolution, rescue-dependency, self-sacrifice, authority-wounding, and silencing — material that, when engaged without preparation, can destabilize rather than liberate. The tier system exists to ensure you have built sufficient foundational stability before engaging these forces. This is consistent with every living lineage: the guru does not give the advanced mantra until the vessel is prepared.
          </p>
        </div>
        <div className="divider-gold max-w-[200px] mt-8" />
      </div>

      {/* ── Main Content ── */}
      <section className="pb-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <BackButton href="/glossary" label="Back to Lexicon" />
        </div>

        {/* ═══ THE TEN MAHĀVIDYĀS ═══ */}
        <div className="max-w-5xl mx-auto px-6 lg:px-10 mt-12">
          <motion.div
            className="text-center mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="block font-mono text-[0.65rem] tracking-[0.3em] text-text-muted/50 mb-4">
              PART I
            </span>
            <p className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
              The Ten Mahāvidyās
            </p>
            <p className="font-display text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
              The ten wisdom goddesses — each a karmic-loop archetype that governs a specific pattern of human bondage and liberation. In the Tantric cosmological framework, these Mahāvidyās are not merely deities to be worshipped but living topologies of consciousness. Each one encodes a complete map of how a particular psychological pattern arises, sustains itself, and can be dissolved through structured sādhana.
            </p>
            <div className="divider-gold max-w-[200px] mx-auto mt-8" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            {mahavidyas.map((archetype, i) => (
              <DeityCard key={archetype.id} archetype={archetype} index={i} />
            ))}
          </motion.div>
        </div>

        {/* ═══ CINEMATIC DIVIDER ═══ */}
        <ScrollParallax speed={-0.15} className="cinematic-strip">
          <CinematicImage
            src="https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/kalki-mirror/tantra/hero-temple-doorway"
            alt="Ancient temple doorway with intricate carvings leading into darkness"
            kenBurns="slow"
            filmGrain={false}
          />
          <div className="cinematic-strip-overlay" />
        </ScrollParallax>

        {/* ═══ SUPPLEMENTARY ARCHETYPES ═══ */}
        <div className="max-w-5xl mx-auto px-6 lg:px-10 mt-24 md:mt-32">
          <motion.div
            className="text-center mb-12"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="block font-mono text-[0.65rem] tracking-[0.3em] text-text-muted/50 mb-4">
              PART II
            </span>
            <p className="section-label mb-4" style={{ letterSpacing: '0.6em' }}>
              Supplementary Archetypes
            </p>
            <p className="font-display text-lg md:text-xl text-text-secondary max-w-xl mx-auto leading-relaxed">
              Six additional archetypes drawn from the Śaiva, Nāth, Vajrayāna, Atharvaṇa, and Aghora streams. While the ten Mahāvidyās form the primary typological framework, these supplementary forces capture karmic loops that the goddess matrix alone does not fully account for — including the guru-disciple transmission, the fire of tapasya, and the alchemy of internal heat. Together, all sixteen archetypes constitute the complete KALKI typology.
            </p>
            <div className="divider-gold max-w-[200px] mx-auto mt-8" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
            initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
            whileInView={staggerContainer.visible}
            viewport={{ once: true, margin: '-60px' }}
          >
            {supplementary.map((archetype, i) => (
              <DeityCard key={archetype.id} archetype={archetype} index={i} />
            ))}
          </motion.div>
        </div>

        {/* ── Divider ── */}
        <motion.div
          className="divider-gold mt-24 max-w-5xl mx-auto"
          initial={reduced ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 0.3, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: 'center' }}
        />

        {/* ── Closing CTA ── */}
        <motion.div
          className="max-w-lg mx-auto mt-16 text-center"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={fadeInUp.visible}
          viewport={{ once: true, margin: '-60px' }}
        >
          <p className="section-label mb-3">THE ARCHETYPE AWAITS</p>
          <p className="font-display text-2xl md:text-3xl tracking-wide mb-3">Which loop is running you?</p>
          <p className="text-text-muted mb-8 max-w-md mx-auto editorial-spacing">
            Every archetype governs a pattern. Every pattern has a sādhana.
            The KALKI system maps the architecture of your loops.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/archetypes" className="gold-cta">Explore Archetypes</Link>
            <Link href="/patterns" className="ghost-cta">Browse Patterns</Link>
          </div>
        </motion.div>
      </section>

      {/* ── Page Footer ── */}
      <div className="relative pb-20 md:pb-28">
        <div className="atmospheric-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-8 border border-gold/20 rounded-full flex items-center justify-center"
            initial={reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-3 h-3 bg-gold/40 rounded-full bindu-pulse" />
          </motion.div>
          <motion.p
            className="font-mono text-[0.75rem] tracking-[0.2em] uppercase text-copper"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            whileInView={fadeInUp.visible}
            viewport={{ once: true }}
          >
            END OF PANTHEON — 16 ARCHETYPES CLASSIFIED
          </motion.p>
        </div>
      </div>
    </div>
  );
}
