'use client';

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'b9oo5abp';
const SMOKE_BG = `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto:good,w_1280,c_limit/e_brightness:0.2/kalki-mirror/ui/smoke-transition`;

/**
 * Wraps page content with a subtle smoke/fade transition on route change.
 * Uses mode="wait" so the exiting page finishes before the entering one starts.
 * Respects prefers-reduced-motion.
 *
 * Includes a smoke-ember overlay during exit for atmospheric transitions.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useNativeReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
        transition={{
          duration: reduced ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative"
      >
        {/* Smoke overlay during exit transition */}
        {!reduced && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: [0, 0.12, 0] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SMOKE_BG}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
              style={{ filter: 'blur(4px) brightness(0.3)' }}
            />
          </motion.div>
        )}
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
