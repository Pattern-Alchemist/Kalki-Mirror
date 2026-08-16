'use client';

import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp } from '@/lib/motion/tokens';

interface ArticleSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ArticleSection({ children, className = '' }: ArticleSectionProps) {
  const reduced = useNativeReducedMotion();
  return (
    <motion.section
      className={`max-w-3xl mx-auto px-6 py-0 ${className}`}
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      whileInView={fadeInUp.visible}
      viewport={{ once: true, margin: '-80px' }}
    >
      {children}
    </motion.section>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="section-label mb-6">{children}</p>;
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-3xl md:text-4xl mb-8 leading-tight">{children}</h2>;
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 text-text-secondary text-lg leading-[1.85]">{children}</div>;
}

export function DropCap({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-text-secondary text-lg leading-[1.85] first-letter:font-display first-letter:text-6xl first-letter:text-gold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-[0.8]">
      {children}
    </p>
  );
}