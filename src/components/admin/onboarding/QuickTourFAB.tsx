'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '@/components/admin/onboarding/TourProvider';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

// =============================================================
// Help Button — lives in the topbar, opens the help slide-over
// Must be a client component because it uses useTour() hook
// =============================================================
export function HelpButton() {
  const { setShowHelp } = useTour();
  return (
    <button
      onClick={() => setShowHelp(true)}
      className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--aw-text-2)] hover:text-[var(--aw-cyan)] hover:bg-[rgba(0,240,255,0.06)] transition-all"
      aria-label="Help & Shortcuts"
      title="Help & Shortcuts (press ?)"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </button>
  );
}

// =============================================================
// Quick Tour FAB — floating button on every admin page
// that launches the tour for the current page.
// =============================================================

// Map pathname → tour ID
const PATH_TOUR_MAP: Record<string, string> = {
  '/admin/overview': 'overview',
  '/admin/war-room': 'war-room',
  '/admin/consultations': 'consultations',
  '/admin/keys': 'keys',
};

export function QuickTourFAB() {
  const pathname = usePathname();
  const { startTour, isTourComplete } = useTour();
  const [visible, setVisible] = useState(false);

  // Determine which tour (if any) is relevant to the current page
  const tourId = Object.entries(PATH_TOUR_MAP).find(([path]) => pathname?.startsWith(path))?.[1];

  useEffect(() => {
    // Show FAB after 1s delay (don't compete with the page load)
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Don't render if no tour for this page or tour already completed
  if (!tourId || isTourComplete(tourId)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => startTour(tourId)}
          className="fixed bottom-6 left-6 z-[40] group flex items-center gap-2 rounded-full bg-[var(--aw-glass-2)] backdrop-blur-xl border border-[var(--aw-border-2)] px-4 py-2.5 shadow-lg shadow-black/40 hover:border-[var(--aw-cyan)] transition-all"
          aria-label={`Start ${tourId} tour`}
        >
          {/* Pulsing dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--aw-cyan)] opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--aw-cyan)]" style={{ boxShadow: '0 0 10px var(--aw-glow-cyan)' }} />
          </span>

          {/* Label */}
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--aw-text-2)] group-hover:text-[var(--aw-cyan)] transition-colors">
            Take Tour
          </span>

          {/* Arrow */}
          <svg className="w-3.5 h-3.5 text-[var(--aw-text-3)] group-hover:text-[var(--aw-cyan)] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
