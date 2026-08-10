'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';
import Link from 'next/link';

export default function PatternsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    console.error('[KALKI] Patterns error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <div className="relative z-10 max-w-md text-center space-y-6">
        <motion.div
          className="mx-auto w-16 h-16 rounded-full border border-red-500/20 flex items-center justify-center"
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-red-400/60 text-lg font-mono">!</span>
        </motion.div>

        <motion.p
          className="section-label"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
        >
          Pattern Disruption
        </motion.p>

        <motion.p
          className="text-text-secondary text-sm editorial-spacing"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.15 }}
        >
          The Pattern Atlas fractured during rendering. The patterns remain intact — this is transient.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.25 }}
        >
          <button onClick={reset} className="gold-cta text-sm">Reconstruct</button>
          <Link href="/patterns" className="ghost-cta text-sm">Pattern Atlas</Link>
        </motion.div>
      </div>
    </div>
  );
}
