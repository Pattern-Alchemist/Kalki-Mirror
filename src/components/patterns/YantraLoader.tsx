'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';

/**
 * Pattern Analysis loading sequence.
 * The screen shows the KALKI monogram while calculating,
 * then progressive text reveals the pattern identification.
 *
 * Usage: <YantraLoader patternName="The Rescuer" onComplete={() => setShow(false)} />
 */

const LOADING_STEPS = [
  'Querying Akashic Archive...',
  'Mapping behavioral loop...',
  'Cross-referencing siddhi database...',
  'Pattern Identified.',
];

interface YantraLoaderProps {
  patternName: string;
  onComplete: () => void;
}

export function YantraLoader({ patternName, onComplete }: YantraLoaderProps) {
  const [step, setStep] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1800),
      setTimeout(() => setStep(3), 2800),
      setTimeout(() => onComplete(), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-deep-black"
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.6 }}
    >
      {/* KALKI monogram while calculating */}
      <motion.div
        className="relative mb-12"
        initial={reduced ? { opacity: 0.8 } : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: step >= 2 ? 1 : 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="/logo.svg"
          alt="KALKI calculating"
          width={80}
          height={80}
        />
      </motion.div>

      {/* Progressive text reveals */}
      <div className="h-24 flex flex-col items-center justify-start gap-3">
        {LOADING_STEPS.map((text, i) => (
          <motion.p
            key={i}
            className={`font-mono text-xs tracking-[0.2em] uppercase transition-colors duration-700 ${
              i < step
                ? i === 3
                  ? 'text-gold'
                  : 'text-text-muted'
                : 'text-transparent'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: i < step ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          >
            {text}
          </motion.p>
        ))}

        {/* Final pattern name reveal */}
        {step >= 3 && (
          <motion.p
            className="font-display text-2xl text-gold tracking-[0.15em] font-light mt-4"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {patternName}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
