'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CinematicImage } from '@/components/ui/CinematicImage';

interface SectionDividerProps {
  image: string;
  caption?: string;
  alt: string;
}

export function SectionDivider({ image, caption, alt }: SectionDividerProps) {
  const reduced = useReducedMotion();
  return (
    <motion.figure
      className="my-20 relative"
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
    >
      <CinematicImage
        src={image}
        alt={alt}
        kenBurns="slow"
        filmGrain
        className="w-full h-[50vh] md:h-[60vh]"
      />
      {caption && (
        <figcaption className="text-center mt-4 text-text-muted text-xs tracking-wider uppercase">
          {caption}
        </figcaption>
      )}
    </motion.figure>
  );
}