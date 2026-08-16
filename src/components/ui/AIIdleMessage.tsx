'use client';

import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp } from '@/lib/motion/tokens';

/**
 * Shared idle/calibrating message shown when the AI engine is unavailable.
 * Replaces 8 identical inline copies across AI components.
 *
 * Default: "The AI engine is calibrating. The geometry awaits its activation."
 * Pass children to override (e.g. AISearchBar's shorter variant).
 */
export function AIIdleMessage({ children, className }: { children?: string; className?: string }) {
  const reduced = useNativeReducedMotion();
  return (
    <motion.p
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      animate={fadeInUp.visible}
      className={`text-xs text-gold-dim${className ? ` ${className}` : ''}`}
    >
      {children || 'The AI engine is calibrating. The geometry awaits its activation.'}
    </motion.p>
  );
}
