'use client';

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BackButton } from '@/components/nav/BackButton';
import { useTier } from '@/components/layout/TierProvider';
import { TIER_LABELS, TIER_ELEMENTS } from '@/lib/utils/tier-gate';
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from '@/lib/motion/tokens';
import type { Tier } from '@/lib/data/types';

// ── Types ───────────────────────────────────────────────────────

interface VaultData {
  tier: Tier;
  remainingKeys: number;
  vault: {
    code: string;
    tierGranted: string;
    maxUses: number;
    usesUsed: number;
    active: boolean;
    createdAt: string;
    expiresAt: string | null;
  }[];
}

type RedeemState = 'idle' | 'loading' | 'success' | 'error';

// ── Icons ───────────────────────────────────────────────────────

function KeyIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function CheckCircleIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" stroke="#C5A059" strokeWidth="1.2" fill="#C5A059" fillOpacity="0.06" />
      <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="#C5A059" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#C5A059" strokeWidth="1.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 019.95 9" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Format helpers ──────────────────────────────────────────────

function formatCode(input: string): string {
  // Auto-format: KALKI-XXXX-XXXX
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.length <= 5) return cleaned;
  const first = cleaned.slice(0, 5);
  const rest = cleaned.slice(5, 9);
  const extra = cleaned.slice(9);
  return `${first}${rest ? '-' + rest : ''}${extra ? '-' + extra : ''}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ── Component ───────────────────────────────────────────────────

export default function RedeemPage() {
  const { tier: currentTier, refreshTier } = useTier();
  const reduced = useReducedMotion();

  const [code, setCode] = useState('');
  const [state, setState] = useState<RedeemState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<{ tierGranted: string; message: string } | null>(null);
  const [vault, setVault] = useState<VaultData | null>(null);
  const [vaultLoading, setVaultLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch vault data on mount
  useEffect(() => {
    async function loadVault() {
      try {
        const res = await fetch('/api/keys?vault=me');
        if (res.ok) {
          const data = await res.json();
          setVault(data);
        }
      } catch {
        // Silently fail — vault info is supplementary
      } finally {
        setVaultLoading(false);
      }
    }
    loadVault();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCode(e.target.value);
    setCode(formatted);
    // Clear error when user types
    if (state === 'error') {
      setState('idle');
      setErrorMessage('');
    }
  }, [state]);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setState('loading');
    setErrorMessage('');
    setSuccessData(null);

    try {
      const res = await fetch('/api/keys/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState('error');
        setErrorMessage(data.error || 'Key redemption failed.');
        return;
      }

      // Success
      setState('success');
      setSuccessData({
        tierGranted: data.tierGranted,
        message: data.message,
      });

      // Refresh the tier context so the whole app updates
      refreshTier();

      // Re-fetch vault to show updated state
      const vaultRes = await fetch('/api/keys?vault=me');
      if (vaultRes.ok) {
        const vaultData = await vaultRes.json();
        setVault(vaultData);
      }
    } catch {
      setState('error');
      setErrorMessage('A network error occurred. Please try again.');
    }
  }, [code, refreshTier]);

  const handleReset = useCallback(() => {
    setCode('');
    setState('idle');
    setErrorMessage('');
    setSuccessData(null);
    inputRef.current?.focus();
  }, []);

  const isActive = (key: { active: boolean; usesUsed: number; maxUses: number }) =>
    key.active && key.usesUsed < key.maxUses;

  return (
    <div className="bg-deep-black min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-32 pb-20">
        <BackButton href="/" label="Back to Home" className="mb-10" />

        <motion.div
          className="max-w-xl mx-auto"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          animate={staggerContainer.visible}
        >
          {/* Section Label */}
          <motion.p variants={staggerItem} className="section-label mb-6">
            Key Redemption
          </motion.p>

          {/* Title */}
          <motion.h1
            variants={staggerItem}
            className="font-display text-4xl md:text-5xl text-foreground mb-4 engraved-heading"
          >
            Enter the Archive
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={staggerItem}
            className="text-text-secondary text-base leading-relaxed mb-10"
          >
            Input your Golden Key to unlock deeper access.
          </motion.p>

          {/* Current Tier & Keys Info */}
          <motion.div variants={staggerItem} className="glass-panel p-5 mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-caption mb-1">Current Access</p>
                <p className="font-display text-xl text-foreground">
                  {TIER_LABELS[currentTier]}
                  <span className="text-text-muted text-sm font-ui ml-2">
                    / {TIER_ELEMENTS[currentTier]}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-caption mb-1">Remaining Keys</p>
                <p className="font-mono text-xl text-gold">
                  {vaultLoading ? (
                    <span className="inline-block w-8 h-6 bg-zinc-800 rounded animate-pulse" />
                  ) : (
                    vault?.remainingKeys ?? 0
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Redemption Card */}
          <motion.div variants={staggerItem} className="glass-panel p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* ── IDLE / LOADING STATE ── */}
              {(state === 'idle' || state === 'loading') && (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={reduced ? { opacity: 1 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <label htmlFor="key-input" className="block text-caption mb-3">
                    Golden Key
                  </label>

                  <div className="relative mb-6">
                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      id="key-input"
                      ref={inputRef}
                      type="text"
                      value={code}
                      onChange={handleInputChange}
                      placeholder="KALKI-XXXX-XXXX"
                      maxLength={15}
                      autoComplete="off"
                      autoCapitalize="characters"
                      disabled={state === 'loading'}
                      className="w-full bg-transparent border border-zinc-700 rounded-sm pl-12 pr-4 py-3.5 text-foreground font-mono text-sm tracking-widest uppercase placeholder:text-zinc-600 placeholder:font-mono placeholder:tracking-widest placeholder:uppercase placeholder:text-sm focus:border-gold/40 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={state === 'loading' || code.trim().length < 5}
                    className="gold-cta w-full flex items-center justify-center gap-3"
                  >
                    {state === 'loading' ? (
                      <>
                        <SpinnerIcon />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <KeyIcon className="w-4 h-4" />
                        <span>Activate Key</span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* ── SUCCESS STATE ── */}
              {state === 'success' && successData && (
                <motion.div
                  key="success"
                  initial={reduced ? { opacity: 1 } : scaleIn.hidden}
                  animate={scaleIn.visible}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-4"
                >
                  <div className="flex justify-center mb-6">
                    <CheckCircleIcon className="w-16 h-16" />
                  </div>

                  <h2 className="font-display text-2xl text-gold mb-2 text-glow-subtle">
                    Key Activated
                  </h2>

                  <p className="font-display text-lg text-foreground mb-1">
                    {TIER_LABELS[successData.tierGranted as Tier]} Covenant
                  </p>
                  <p className="text-text-muted text-sm font-ui mb-6">
                    / {TIER_ELEMENTS[successData.tierGranted as Tier]}
                  </p>

                  <p className="text-text-secondary text-sm leading-relaxed mb-8">
                    {successData.message}
                  </p>

                  <div className="divider-gold mb-8" />

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/archive" className="gold-cta text-center">
                      Enter the Archive
                    </Link>
                    <button
                      onClick={handleReset}
                      className="ghost-cta"
                    >
                      Redeem Another Key
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── ERROR STATE ── */}
              {state === 'error' && (
                <motion.div
                  key="error"
                  initial={reduced ? { opacity: 1 } : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start gap-3 mb-6">
                    <svg className="w-6 h-6 text-crimson shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.06" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <div>
                      <p className="font-display text-lg text-foreground mb-1">Redemption Failed</p>
                      <p className="text-text-secondary text-sm leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="ghost-cta w-full"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Generated Keys History */}
          {!vaultLoading && vault && vault.vault.length > 0 && (
            <motion.div variants={staggerItem} className="mt-8">
              <p className="text-caption mb-4">Your Keys</p>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {vault.vault.map((key) => (
                  <div
                    key={key.code}
                    className={`glass-chip p-4 flex items-center justify-between flex-wrap gap-3 ${
                      !isActive(key) ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${isActive(key) ? 'bg-gold' : 'bg-zinc-600'}`} />
                      <span className="font-mono text-sm text-foreground tracking-wider">
                        {key.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-muted font-ui">
                      <span className="px-2 py-0.5 rounded-sm bg-zinc-800/50 text-text-secondary">
                        {TIER_LABELS[key.tierGranted as Tier] ?? key.tierGranted}
                      </span>
                      <span>{key.usesUsed}/{key.maxUses} used</span>
                      <span className="hidden sm:inline">Exp {formatDate(key.expiresAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Bottom Link */}
          <motion.div variants={staggerItem} className="mt-10 text-center">
            <p className="text-text-muted text-sm mb-2">Don&apos;t have a key?</p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-gold-dim hover:text-gold text-xs font-ui tracking-[0.12em] uppercase transition-colors duration-300 group"
            >
              View Sacred Offerings
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
