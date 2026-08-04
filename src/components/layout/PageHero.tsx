'use client';

import { CinematicImage } from '@/components/ui/CinematicImage';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

interface PageHeroProps {
  image: string;
  title: string;
  subtitle?: string;
  sectionLabel?: string;
  minH?: string;
}

export function PageHero({ image, title, subtitle, sectionLabel, minH = 'h-[50vh]' }: PageHeroProps) {
  const reduced = useReducedMotion();
  return (
    <header className={`relative ${minH} flex items-end`}>
      <CinematicImage
        src={image}
        alt={title}
        kenBurns="slow"
        scrim="bottom"
        priority
      />
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16 pt-32">
        {sectionLabel && (
          <motion.p
            className="section-label mb-4"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
          >
            {sectionLabel}
          </motion.p>
        )}
        <motion.h1
          className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-text-secondary text-lg md:text-xl max-w-2xl"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </header>
  );
}
