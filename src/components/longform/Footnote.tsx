'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface FootnoteProps {
  id: string;
  children: React.ReactNode;
}

export function Footnote({ id, children }: FootnoteProps) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-ui text-gold-dim hover:text-gold border border-gold-dim/40 rounded-full hover:border-gold transition-colors align-super mx-0.5"
        aria-label={`Footnote ${id}`}
        aria-expanded={open}
      >
        {id}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 glass-chip p-4 z-30 shadow-xl"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-text-secondary text-xs leading-relaxed">{children}</p>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-text-muted hover:text-gold text-xs"
              aria-label="Close footnote"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}