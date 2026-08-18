'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp } from '@/lib/motion/tokens';
import Link from 'next/link';

export default function AghoriTantraError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reduced = useNativeReducedMotion();

  useEffect(() => {
    console.error('[KALKI] AghoriTantra error:', error);
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
          Tantra Disruption
        </motion.p>

        <motion.p
          className="text-text-secondary text-sm editorial-spacing"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.15 }}
        >
          The Āghori Tantra course encountered an error. This is transient.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.25 }}
        >
          <button onClick={reset} className="gold-cta text-sm">Reconstruct</button>
          <Link href="/aghori-tantra" className="ghost-cta text-sm">Āghori Tantra</Link>
        </motion.div>
      </div>
    </div>
  );
}
