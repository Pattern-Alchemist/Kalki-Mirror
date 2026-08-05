import type { Variants, Transition } from 'framer-motion';

// === TRANSITIONS ===
export const transitions = {
  smooth: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as Transition,
  quick: { duration: 0.3, ease: 'easeOut' } as Transition,
  slow: { duration: 1.0, ease: [0.22, 1, 0.36, 1] } as Transition,
  spring: { type: 'spring', stiffness: 120, damping: 20 } as Transition,
} as const;

// === FADE VARIANTS ===
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.smooth },
  exit: { opacity: 0, transition: transitions.quick },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
  exit: { opacity: 0, y: -10, transition: transitions.quick },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.smooth },
};

// === SCALE VARIANTS ===
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: transitions.spring },
  exit: { opacity: 0, scale: 0.95, transition: transitions.quick },
};

// === SLIDE VARIANTS ===
export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: transitions.smooth },
};

// === METER FILL ===
export const meterFill = (score: number): Variants => ({
  hidden: { width: '0%' },
  visible: { width: `${score}%`, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 } },
});
