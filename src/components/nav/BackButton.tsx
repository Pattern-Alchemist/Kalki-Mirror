'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { fadeInUp } from '@/lib/motion/tokens';

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
  const reduced = useNativeReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
      animate={fadeInUp.visible}
      className={className}
    >
      <Link
        href={href}
        prefetch={false}
        className="inline-flex items-center gap-2 text-gold-dim hover:text-gold text-xs font-ui tracking-[0.12em] uppercase transition-colors duration-300 group"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="transition-transform duration-300 group-hover:-translate-x-1"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {label}
      </Link>
    </motion.div>
  );
}
