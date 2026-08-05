'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

interface BlockquoteProps {
  children: React.ReactNode;
  attribution?: string;
  source?: string;
}

export function Blockquote({ children, attribution, source }: BlockquoteProps) {
  const reduced = useReducedMotion();
  return (
    <motion.blockquote
      className="relative border-l-2 border-gold-dim pl-8 py-2 my-12"
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-80px' }}
    >
      <p className="font-display text-xl md:text-2xl text-foreground/90 leading-relaxed italic">
        {children}
      </p>
      {(attribution || source) && (
        <footer className="mt-4 flex flex-col gap-1">
          {attribution && <cite className="text-gold text-sm font-ui not-italic">{attribution}</cite>}
          {source && <span className="text-text-muted text-xs">{source}</span>}
        </footer>
      )}
    </motion.blockquote>
  );
}