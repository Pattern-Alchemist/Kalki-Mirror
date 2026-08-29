'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { useIsTouchDevice } from '@/hooks/useClientEnv';
import { cn } from '@/lib/utils';

interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  /** Max tilt in degrees. Default: 6 */
  tilt?: number;
  /** Glare intensity 0-1. Default: 0.04 */
  glare?: number;
  /** Scale on hover. Default: 1.02 */
  hoverScale?: number;
}

/**
 * MagneticCard — wraps any card in a 3D tilt effect that follows the cursor.
 * Uses onMouseMove to compute rotateX/Y from cursor position relative to
 * the card center. Includes a subtle light glare that follows the cursor.
 * Respects prefers-reduced-motion and disables on touch devices.
 */
export function MagneticCard({
  children,
  className,
  tilt = 6,
  glare = 0.04,
  hoverScale = 1.02,
}: MagneticCardProps) {
  const reduced = useNativeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, x: 0, y: 0, scale: 1 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  // Detect touch device — disable 3D tilt on mobile/touch
  const isTouch = useIsTouchDevice();

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduced || isTouch) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const percentX = (e.clientX - rect.left) / rect.width;
      const percentY = (e.clientY - rect.top) / rect.height;

      const rotateY = ((percentX - 0.5) * 2) * tilt;
      const rotateX = ((0.5 - percentY) * 2) * tilt;
      const pullX = (percentX - 0.5) * 3;
      const pullY = (percentY - 0.5) * 3;

      setTransform({ rotateX, rotateY, x: pullX, y: pullY, scale: hoverScale });
      setGlarePos({ x: percentX * 100, y: percentY * 100, opacity: 1 });
    },
    [reduced, tilt, hoverScale, isTouch]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0, x: 0, y: 0, scale: 1 });
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  }, []);

  if (reduced || isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn('relative', className)}
      style={{ perspective: '800px' }}
    >
      <motion.div
        animate={{
          rotateX: transform.rotateX,
          rotateY: transform.rotateY,
          x: transform.x,
          y: transform.y,
          scale: transform.scale,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.5,
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glare overlay — follows cursor position */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(212,175,55,${glare}), transparent 60%)`,
            opacity: glarePos.opacity,
            transition: 'opacity 0.3s ease',
          }}
        />
        {children}
      </motion.div>
    </div>
  );
}
