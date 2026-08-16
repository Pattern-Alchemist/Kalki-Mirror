'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp } from '@/lib/motion/tokens';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'b9oo5abp';
const ERROR_BG = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto:good,w_1280,c_limit/e_brightness:0.15/kalki-mirror/ui/yantra-error`;

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const reduced = useReducedMotion();

  useEffect(() => {
    console.error('[KALKI] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Yantra error background — very subtle, darkened */}
      <div className="absolute inset-0 z-0 opacity-15 blur-md" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ERROR_BG}
          alt=""
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* Atmospheric overlays */}
      <div className="atmospheric-bg absolute inset-0 opacity-40 z-[1]" aria-hidden="true" />
      <div className="page-vignette absolute inset-0 pointer-events-none z-[2]" aria-hidden="true" />

      <div className="relative z-10 max-w-md text-center space-y-6">
        {/* Yantra spinner */}
        <motion.div
          className="mx-auto mb-4 w-20 h-20 relative"
          initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.6, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full h-full rounded-full border-2 border-red-500/20 flex items-center justify-center">
            <span className="text-red-400/60 text-2xl font-mono">!</span>
          </div>
          {/* Fracture lines radiating out */}
          <div className="absolute inset-0" aria-hidden="true">
            <div className="absolute top-0 left-1/2 w-px h-4 bg-gradient-to-b from-red-500/20 to-transparent -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-px h-4 bg-gradient-to-t from-red-500/20 to-transparent -translate-x-1/2" />
            <div className="absolute left-0 top-1/2 h-px w-4 bg-gradient-to-r from-red-500/20 to-transparent -translate-y-1/2" />
            <div className="absolute right-0 top-1/2 h-px w-4 bg-gradient-to-l from-red-500/20 to-transparent -translate-y-1/2" />
          </div>
        </motion.div>

        <motion.p
          className="section-label"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.15 }}
        >
          System Error
        </motion.p>

        <motion.h1
          className="font-display text-2xl text-foreground font-light tracking-wide"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.25 }}
        >
          The geometry fractured.
        </motion.h1>

        <motion.p
          className="text-text-secondary text-sm editorial-spacing"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.35 }}
        >
          An unexpected error occurred. The archive remains intact —
          this is a transient disruption in the rendering layer.
        </motion.p>

        {error.digest && (
          <motion.p
            className="font-mono text-xs text-text-muted"
            initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
            animate={fadeInUp.visible}
            transition={{ delay: 0.4 }}
          >
            Error ID: {error.digest}
          </motion.p>
        )}

        <motion.div
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.45 }}
        >
          <button onClick={reset} className="gold-cta text-sm">
            Reconstruct
          </button>
        </motion.div>

        <motion.p
          className="text-text-muted text-xs"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          animate={fadeInUp.visible}
          transition={{ delay: 0.55 }}
        >
          If this persists, consult the archivist.
        </motion.p>
      </div>
    </div>
  );
}