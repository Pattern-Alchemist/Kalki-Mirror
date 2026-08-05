'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AmbientBackgroundProps {
  className?: string;
}

export function AmbientBackground({ className }: AmbientBackgroundProps) {
  const prefersReduced = useReducedMotion();

  return (
    <div
      className={cn('fixed inset-0 overflow-hidden pointer-events-none z-0', className)}
      aria-hidden="true"
    >
      {/* Śrī Cakra — simplified concentric triangles */}
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[600px] opacity-[0.06]"
        animate={prefersReduced ? {} : { rotate: 360 }}
        transition={prefersReduced ? undefined : { duration: 120, repeat: Infinity, ease: 'linear' }}
        fill="none"
        stroke="var(--gold-dim)"
        strokeWidth="0.5"
      >
        <polygon points="200,40 340,320 60,320" />
        <polygon points="200,360 340,80 60,80" />
        <circle cx="200" cy="200" r="150" />
        <circle cx="200" cy="200" r="100" />
        <circle cx="200" cy="200" r="50" />
        <circle cx="200" cy="200" r="8" fill="var(--gold-dim)" stroke="none" />
      </motion.svg>

      {/* CSS-only ambient particles */}
      {!prefersReduced && (
        <div className="absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute block w-[2px] h-[2px] rounded-full"
              style={{
                left: `${8 + (i * 7.6) % 84}%`,
                top: `${5 + (i * 11.3) % 88}%`,
                background: 'var(--gold-dim)',
                opacity: 0.25 + (i % 4) * 0.12,
                animation: `particleFloat ${6 + (i % 5) * 2}s ease-in-out ${(i % 3) * 1.5}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes particleFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0.15; }
          100% { transform: translateY(-18px) translateX(8px); opacity: 0.45; }
        }
      `}</style>
    </div>
  );
}
