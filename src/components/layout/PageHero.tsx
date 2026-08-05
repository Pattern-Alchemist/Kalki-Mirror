'use client';

import { CinematicImage } from '@/components/ui/CinematicImage';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  image: string;
  title: string;
  subtitle?: string;
  sectionLabel?: string;
  minH?: string;
  scrim?: 'bottom' | 'full' | 'top';
  kenBurns?: 'normal' | 'slow' | 'none';
  vignette?: boolean;
  volumetric?: boolean;
  dust?: boolean;
}

export function PageHero({
  image,
  title,
  subtitle,
  sectionLabel,
  minH = 'min-h-[70vh]',
  scrim = 'bottom',
  kenBurns = 'slow',
  vignette = true,
  volumetric = true,
  dust = true,
}: PageHeroProps) {
  const reduced = useReducedMotion();
  return (
    <header className={cn('relative flex items-end', minH)}>
      <CinematicImage
        src={image}
        alt={title}
        kenBurns={kenBurns}
        scrim={scrim}
        vignette={vignette}
        volumetric={volumetric}
        dust={dust}
        priority
      />
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-20 md:pb-28 pt-32">
        {sectionLabel && (
          <motion.p
            className="section-label mb-6"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            {sectionLabel}
          </motion.p>
        )}
        <motion.h1
          className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 engraved-heading font-light"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-text-secondary text-lg md:text-xl max-w-2xl editorial-spacing"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </header>
  );
}
