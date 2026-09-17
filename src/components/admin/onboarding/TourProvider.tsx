'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =============================================================
// KALKI ADMIN — Onboarding/Tour System (Vol. 8 Enhancement #1-5)
// -------------------------------------------------------------
// A complete coach-mark + tutorial system with:
//   1. TourProvider context — manages tour state, localStorage flags
//   2. Coach-mark overlay — spotlight mask + tooltip on [data-tour] elements
//   3. Welcome modal — first-run 3-step intro
//   4. Help slide-over — keyboard shortcuts + page tips + tour launcher
//   5. "What's New" modal — triggered on version bump
//
// Usage:
//   <TourProvider> wraps the admin layout
//   Any element: <div data-tour="war-room-cards">...</div>
//   Start tour: const { startTour } = useTour(); startTour('overview');
// =============================================================

export interface TourStep {
  target: string;       // data-tour attribute value
  title: string;
  body: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface TourDefinition {
  id: string;
  name: string;
  steps: TourStep[];
}

// Tour definitions for each admin page
export const TOURS: Record<string, TourDefinition> = {
  overview: {
    id: 'overview',
    name: 'Overview Dashboard',
    steps: [
      {
        target: 'aw-topbar',
        title: 'Command Bar',
        body: 'This is your HUD strip. Environment badge, 2FA status, pending counts, and the help button — all visible at a glance.',
        position: 'bottom',
      },
      {
        target: 'aw-sidebar',
        title: 'Navigation',
        body: 'Your command deck. Press Cmd+K (or Ctrl+K) anytime to open the command palette and jump anywhere instantly.',
        position: 'right',
      },
      {
        target: 'overview-pulse',
        title: 'Campaign Pulse',
        body: 'Live war-room mini-strip — leads, top campaign, top source, booking rate. Refreshes every 60 seconds.',
        position: 'bottom',
      },
      {
        target: 'overview-quick-actions',
        title: 'Quick Actions',
        body: 'One-tap shortcuts to the four most-used surfaces: Keys, Content, Audit, Consultations.',
        position: 'top',
      },
      {
        target: 'overview-tiers',
        title: 'Tier Distribution',
        body: 'Your member pyramid — Prithvi, Jal, Agni, Akash. This is your monetization health at a glance.',
        position: 'top',
      },
    ],
  },
  'war-room': {
    id: 'war-room',
    name: 'War Room',
    steps: [
      {
        target: 'aw-topbar',
        title: 'The War Room',
        body: '17 panels of live intelligence. This is your daily command center — lead velocity, geo split, campaign ROI, AI health, drill verdicts.',
        position: 'bottom',
      },
      {
        target: 'war-room-range',
        title: 'Time Range',
        body: 'Switch between 7d, 30d, 90d, or All-time views. Every panel responds to your selection.',
        position: 'bottom',
      },
      {
        target: 'war-room-leads',
        title: 'Lead Velocity',
        body: 'Daily lead count over the selected range. Watch for spikes (campaigns landing) and dips (chain degradation, cron failures).',
        position: 'top',
      },
      {
        target: 'war-room-ai',
        title: 'AI Health',
        body: 'Chain status, per-model latency, golden-ask eval results. If this panel is red, /ask is broken and seekers see errors.',
        position: 'top',
      },
    ],
  },
  consultations: {
    id: 'consultations',
    name: 'Consultations Pipeline',
    steps: [
      {
        target: 'aw-topbar',
        title: 'Consultations Kanban',
        body: 'Your lead pipeline. New → Acknowledged → Scheduled → Completed → Cancelled. Each card is a seeker.',
        position: 'bottom',
      },
      {
        target: 'consultations-filters',
        title: 'Filters',
        body: 'Filter by country, source kind (paid/organic/referral/direct), or payment state. Find the needle in your funnel.',
        position: 'bottom',
      },
      {
        target: 'consultations-board',
        title: 'Lead Cards',
        body: 'Click any card to open the drawer — outcome writer, payment reconciliation, WhatsApp deep-link, testimonial nudge.',
        position: 'center',
      },
    ],
  },
  keys: {
    id: 'keys',
    name: 'Golden Keys',
    steps: [
      {
        target: 'keys-mint-form',
        title: 'Batch Mint',
        body: 'Mint up to 50 keys at once. Set tier, max uses, and campaign tag for attribution tracking.',
        position: 'bottom',
      },
      {
        target: 'keys-table',
        title: 'Key Ledger',
        body: 'Every key with redemption count, campaign tag, active status. Search by code, creator, or campaign.',
        position: 'top',
      },
    ],
  },
};

interface TourContextValue {
  activeTour: string | null;
  currentStep: number;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  endTour: () => void;
  isTourComplete: (tourId: string) => boolean;
  showWelcome: boolean;
  dismissWelcome: () => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showWhatsNew: boolean;
  dismissWhatsNew: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used within TourProvider');
  return ctx;
}

const APP_VERSION = '8.0.0';

export function TourProvider({ children }: { children: ReactNode }) {
  const [activeTour, setActiveTour] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  // First-run check — show welcome modal on first login
  useEffect(() => {
    const welcomed = localStorage.getItem('kalki-admin-welcomed-v1');
    if (!welcomed) {
      setShowWelcome(true);
    }
    // Check for version bump → show "What's New"
    const seenVersion = localStorage.getItem('kalki-admin-seen-version');
    if (seenVersion !== APP_VERSION) {
      setShowWhatsNew(true);
      localStorage.setItem('kalki-admin-seen-version', APP_VERSION);
    }
  }, []);

  const startTour = useCallback((tourId: string) => {
    const tour = TOURS[tourId];
    if (!tour) return;
    setActiveTour(tourId);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    const tour = TOURS[activeTour];
    if (!tour) return;
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // Tour complete
      localStorage.setItem(`kalki-admin-tour-${activeTour}-completed`, '1');
      setActiveTour(null);
      setCurrentStep(0);
    }
  }, [activeTour, currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const endTour = useCallback(() => {
    if (activeTour) {
      localStorage.setItem(`kalki-admin-tour-${activeTour}-completed`, '1');
    }
    setActiveTour(null);
    setCurrentStep(0);
  }, [activeTour]);

  const isTourComplete = useCallback((tourId: string) => {
    return localStorage.getItem(`kalki-admin-tour-${tourId}-completed`) === '1';
  }, []);

  const dismissWelcome = useCallback(() => {
    localStorage.setItem('kalki-admin-welcomed-v1', '1');
    setShowWelcome(false);
  }, []);

  const dismissWhatsNew = useCallback(() => {
    setShowWhatsNew(false);
  }, []);

  // Keyboard: Esc closes tour/help
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showHelp) setShowHelp(false);
        else if (activeTour) endTour();
      }
      // '?' opens help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShowHelp((s) => !s);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTour, showHelp, endTour]);

  const tour = activeTour ? TOURS[activeTour] : null;
  const step = tour && currentStep < tour.steps.length ? tour.steps[currentStep] : null;

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        endTour,
        isTourComplete,
        showWelcome,
        dismissWelcome,
        showHelp,
        setShowHelp,
        showWhatsNew,
        dismissWhatsNew,
      }}
    >
      {children}

      {/* ── Coach-mark Overlay ── */}
      <AnimatePresence>
        {step && (
          <CoachMarkOverlay
            step={step}
            stepNumber={currentStep + 1}
            totalSteps={tour?.steps.length ?? 0}
            onNext={nextStep}
            onPrev={prevStep}
            onEnd={endTour}
          />
        )}
      </AnimatePresence>

      {/* ── Welcome Modal ── */}
      <AnimatePresence>
        {showWelcome && <WelcomeModal onDismiss={dismissWelcome} onStartTour={() => { dismissWelcome(); startTour('overview'); }} />}
      </AnimatePresence>

      {/* ── Help Slide-over ── */}
      <AnimatePresence>
        {showHelp && <HelpSlideOver onClose={() => setShowHelp(false)} />}
      </AnimatePresence>

      {/* ── What's New Modal ── */}
      <AnimatePresence>
        {showWhatsNew && <WhatsNewModal onDismiss={dismissWhatsNew} />}
      </AnimatePresence>
    </TourContext.Provider>
  );
}

// ── Coach-mark Overlay ──────────────────────────────────────

function CoachMarkOverlay({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onEnd,
}: {
  step: TourStep;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onEnd: () => void;
}) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const findTarget = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };
    findTarget();
    // Re-find on resize/scroll
    window.addEventListener('resize', findTarget);
    window.addEventListener('scroll', findTarget, true);
    const interval = setInterval(findTarget, 500); // poll for lazy-loaded elements
    return () => {
      window.removeEventListener('resize', findTarget);
      window.removeEventListener('scroll', findTarget, true);
      clearInterval(interval);
    };
  }, [step.target]);

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const padding = 16;
    const pos = step.position ?? 'bottom';
    switch (pos) {
      case 'top':
        return { top: targetRect.top - padding, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
      case 'bottom':
        return { top: targetRect.bottom + padding, left: targetRect.left + targetRect.width / 2, transform: 'translateX(-50%)' };
      case 'left':
        return { top: targetRect.top + targetRect.height / 2, left: targetRect.left - padding, transform: 'translate(-100%, -50%)' };
      case 'right':
        return { top: targetRect.top + targetRect.height / 2, left: targetRect.right + padding, transform: 'translateY(-50%)' };
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] pointer-events-none"
    >
      {/* Spotlight mask — dark overlay with a "hole" around the target */}
      {targetRect && (
        <div
          className="absolute pointer-events-auto"
          style={{
            position: 'fixed',
            inset: 0,
            background: `rgba(0, 0, 0, 0.75)`,
            // Create a "hole" using box-shadow trick
            boxShadow: targetRect
              ? `0 0 0 9999px rgba(0, 0, 0, 0.75)`
              : undefined,
            borderRadius: 0,
          }}
        >
          {/* The "hole" element */}
          <div
            className="absolute border-2 border-[var(--aw-cyan)] rounded-lg transition-all duration-300"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75), 0 0 30px rgba(0, 240, 255, 0.4)',
              background: 'transparent',
            }}
          />
        </div>
      )}
      {/* If no target found, just dark overlay */}
      {!targetRect && (
        <div className="absolute inset-0 bg-black/75 pointer-events-auto" />
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.1 }}
        className="absolute pointer-events-auto"
        style={getTooltipStyle()}
      >
        <div className="aw-surface-2 rounded-xl p-5 max-w-[320px] shadow-2xl shadow-black/80">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="aw-badge aw-badge--info">{stepNumber} / {totalSteps}</span>
              <span className="text-[10px] font-mono text-[var(--aw-text-3)] uppercase tracking-wider">{step.position ?? 'bottom'}</span>
            </div>
            <button onClick={onEnd} className="text-[var(--aw-text-3)] hover:text-[var(--aw-danger)] transition-colors" aria-label="Close tour">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg text-[var(--aw-text)] mb-2 aw-glow-text">{step.title}</h3>

          {/* Body */}
          <p className="text-sm text-[var(--aw-text-2)] leading-relaxed mb-4">{step.body}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === stepNumber - 1 ? 'w-6 bg-[var(--aw-cyan)]' : 'w-1.5 bg-[var(--aw-text-3)]/40'}`}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {stepNumber > 1 && (
              <button onClick={onPrev} className="aw-btn aw-btn-ghost text-xs">← Back</button>
            )}
            <button onClick={onNext} className="aw-btn aw-btn-primary text-xs flex-1 justify-center">
              {stepNumber === totalSteps ? '✓ Done' : 'Next →'}
            </button>
            <button onClick={onEnd} className="aw-btn aw-btn-ghost text-xs">Skip</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Welcome Modal ────────────────────────────────────────────

function WelcomeModal({ onDismiss, onStartTour }: { onDismiss: () => void; onStartTour: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      title: 'Welcome to the Console',
      body: 'Your alien warship command deck. Every tool you need to run KALKI — leads, keys, content, AI, money — is one click away.',
    },
    {
      icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
      title: 'Press ? Anytime for Help',
      body: 'Keyboard shortcuts, page tips, and guided tours are always one key press away. Try it now — press the ? key.',
    },
    {
      icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
      title: 'Cmd+K = Navigate Anything',
      body: 'Jump to any page, search any entity, or run commands. The command palette is your fastest path to everything.',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="aw-surface-2 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated grid background inside modal */}
        <div className="relative mb-6">
          <div className="absolute -top-4 -left-4 -right-4 -bottom-4 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-[rgba(0,240,255,0.08)] border border-[var(--aw-border-strong)] flex items-center justify-center" style={{ boxShadow: '0 0 30px -5px var(--aw-glow-cyan)' }}>
              <svg className="w-8 h-8 text-[var(--aw-cyan)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d={steps[step].icon} />
              </svg>
            </div>
          </div>
        </div>

        {/* Step content */}
        <h2 className="font-display text-2xl text-[var(--aw-text)] text-center mb-3 aw-glow-text">{steps[step].title}</h2>
        <p className="text-sm text-[var(--aw-text-2)] text-center leading-relaxed mb-6">{steps[step].body}</p>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-[var(--aw-cyan)]' : 'w-2 bg-[var(--aw-text-3)]/40 hover:bg-[var(--aw-text-3)]/60'}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="aw-btn aw-btn-ghost flex-1">← Back</button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="aw-btn aw-btn-primary flex-1 justify-center">Next →</button>
          ) : (
            <button onClick={onStartTour} className="aw-btn aw-btn-primary flex-1 justify-center">Start Tour →</button>
          )}
          <button onClick={onDismiss} className="aw-btn aw-btn-ghost text-xs">Skip</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Help Slide-over ──────────────────────────────────────────

function HelpSlideOver({ onClose }: { onClose: () => void }) {
  const { startTour, isTourComplete } = useTour();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // Determine which tours are relevant to the current page
  const relevantTours = Object.values(TOURS).filter((t) => {
    if (pathname.includes(t.id) || (t.id === 'overview' && pathname === '/admin/overview')) return true;
    return false;
  });

  const shortcuts = [
    { keys: ['Cmd', 'K'], label: 'Open command palette' },
    { keys: ['Cmd', 'Shift', 'F'], label: 'Search entities' },
    { keys: ['?'], label: 'Toggle this help panel' },
    { keys: ['Esc'], label: 'Close any modal/overlay' },
    { keys: ['1', '-', '8'], label: 'Jump to nav section 1–8' },
    { keys: ['Cmd', 'Shift', 'L'], label: 'Sign out' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex justify-end"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-sm h-full aw-surface-2 rounded-l-2xl overflow-y-auto p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg text-[var(--aw-text)] aw-glow-text">Help & Shortcuts</h2>
          <button onClick={onClose} className="text-[var(--aw-text-3)] hover:text-[var(--aw-danger)] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Keyboard shortcuts */}
        <div className="mb-6">
          <h3 className="aw-label mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2">
            {shortcuts.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[var(--aw-border)]">
                <span className="text-sm text-[var(--aw-text-2)]">{s.label}</span>
                <div className="flex gap-1">
                  {s.keys.map((k) => (
                    <kbd key={k} className="aw-mono text-[10px] px-1.5 py-0.5 rounded bg-[var(--aw-glass-1)] border border-[var(--aw-border-2)] text-[var(--aw-cyan)]">{k}</kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tours */}
        <div className="mb-6">
          <h3 className="aw-label mb-3">Guided Tours</h3>
          <div className="space-y-2">
            {Object.values(TOURS).map((tour) => (
              <button
                key={tour.id}
                onClick={() => { onClose(); startTour(tour.id); }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--aw-glass-1)] border border-[var(--aw-border)] hover:border-[var(--aw-cyan)] hover:bg-[rgba(0,240,255,0.04)] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(0,240,255,0.08)] border border-[var(--aw-border-2)] flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--aw-cyan)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--aw-text)] group-hover:text-[var(--aw-cyan)] transition-colors">{tour.name}</p>
                    <p className="text-[10px] text-[var(--aw-text-3)]">{tour.steps.length} steps</p>
                  </div>
                </div>
                {isTourComplete(tour.id) && (
                  <span className="aw-badge aw-badge--success text-[8px]">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* What's New link */}
        <div>
          <h3 className="aw-label mb-3">About</h3>
          <div className="p-3 rounded-lg bg-[var(--aw-glass-1)] border border-[var(--aw-border)]">
            <p className="text-xs text-[var(--aw-text-2)] leading-relaxed">
              KALKI Admin v{APP_VERSION} — Alien Warship Edition. The entire console was redesigned with glassmorphism, neon HUD elements, and animated grid backgrounds. Press <kbd className="aw-mono text-[10px] px-1 py-0.5 rounded bg-[var(--aw-glass-1)] border border-[var(--aw-border-2)] text-[var(--aw-cyan)]">?</kbd> anytime to return here.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── What's New Modal ─────────────────────────────────────────

function WhatsNewModal({ onDismiss }: { onDismiss: () => void }) {
  const changes = [
    { icon: '🎨', title: 'Alien Warship UI', body: 'Complete redesign: glassmorphism, neon cyan, animated grid backgrounds, HUD-style cards with corner brackets.' },
    { icon: '🚀', title: 'Onboarding System', body: 'Coach-mark tours, welcome modal, help slide-over with keyboard shortcuts. Press ? anytime.' },
    { icon: '🤖', title: 'Custom Chat Widget', body: 'Floating gold bubble with AI Q&A (grounded in your corpus), WhatsApp routing, and email capture.' },
    { icon: '🌐', title: '/hi/ Locale Twins', body: '106 hi-locale pages with hreflang alternates and canonical-to-EN pattern.' },
    { icon: '📊', title: 'Eval Harness', body: 'Nightly golden-set evaluation with 2-strike alarm doctrine and Vercel cron heartbeat.' },
    { icon: '🛡️', title: 'TOTP Break-Glass', body: '2FA re-enrollable; admin login secured.' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[210] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="aw-surface-2 rounded-2xl p-8 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl text-[var(--aw-text)] aw-glow-text">What's New</h2>
            <p className="text-xs text-[var(--aw-text-3)] aw-mono mt-1">Version {APP_VERSION}</p>
          </div>
          <button onClick={onDismiss} className="text-[var(--aw-text-3)] hover:text-[var(--aw-danger)] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-3">
          {changes.map((c) => (
            <div key={c.title} className="aw-card p-4 flex items-start gap-3">
              <span className="text-2xl shrink-0">{c.icon}</span>
              <div>
                <h3 className="font-medium text-[var(--aw-text)] mb-1">{c.title}</h3>
                <p className="text-sm text-[var(--aw-text-2)] leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={onDismiss} className="aw-btn aw-btn-primary w-full justify-center mt-6">
          Got it →
        </button>
      </motion.div>
    </motion.div>
  );
}
