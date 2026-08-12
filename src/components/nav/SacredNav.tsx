'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/archive', label: 'Akashic' },
  { href: '/archetypes', label: 'Archetypes' },
  { href: '/patterns', label: 'Patterns' },
  { href: '/dossier', label: 'Dossier' },
  { href: '/practice', label: 'Tantra' },
  { href: '/library', label: 'Library' },
  { href: '/aghoiri-tantra', label: 'Aghori Tantra' },
  { href: '/method', label: 'The Method' },
  { href: '/consultations', label: 'Consult' },
  { href: '/codex', label: 'Codex' },
  { href: '/pricing', label: 'Membership' },
];

export function SacredNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
          scrolled
            ? 'glass-nav'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[4.25rem] md:h-[5.25rem]">
            {/* Logo — KALKI wordmark */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              <span className="font-display text-xl md:text-2xl tracking-[0.28em] gold-foil-text font-light nav-logo-glow">
                KALKI
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-9">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-[0.8375rem] font-ui tracking-[0.19em] uppercase transition-all duration-500 py-1 nav-link-glow',
                    isActive(link.href)
                      ? 'text-gold nav-link-active'
                      : 'text-ivory/80 hover:text-ivory'
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent, var(--gold-bright), var(--gold), var(--gold-bright), transparent)',
                        boxShadow: '0 0 8px rgba(212,175,55,0.5), 0 0 20px rgba(212,175,55,0.2)',
                      }}
                      layoutId="nav-underline"
                      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden relative z-10 w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <div className="relative w-5 h-4">
                <span
                  className={cn(
                    'absolute left-0 h-px bg-gold transition-all duration-500',
                    mobileOpen ? 'top-1/2 w-5 -translate-y-1/2 rotate-45' : 'top-0 w-4'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-px bg-gold transition-all duration-500',
                    mobileOpen ? 'opacity-0 w-0' : 'w-5 -translate-y-1/2'
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-px bg-gold transition-all duration-500',
                    mobileOpen ? 'top-1/2 w-5 -translate-y-1/2 -rotate-45' : 'bottom-0 w-3'
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Backdrop — pure Akasha void */}
            <div className="absolute inset-0 bg-deep-black/95 backdrop-blur-2xl" />

            <div className="relative z-10 flex flex-col justify-center h-full px-6 py-20 safe-area-x">
              {/* KALKI wordmark centered at top of menu */}
              <div className="mb-10 flex justify-center">
                <span className="font-display text-3xl tracking-[0.3em] gold-foil-text font-light">
                  KALKI
                </span>
              </div>
              <div className="mb-5 text-center text-caption">Explore the archive</div>
              <nav className="flex flex-col gap-1" aria-label="Primary navigation — mobile">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.5,
                      delay: reduced ? 0 : 0.08 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'font-display text-2xl md:text-4xl tracking-[0.12em] py-2 transition-colors duration-500 font-light neon-tab-glow',
                        isActive(link.href)
                          ? 'text-gold'
                          : 'text-text-muted hover:text-ivory'
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom tagline */}
              <motion.p
                className="absolute bottom-12 left-10 text-caption"
                initial={reduced ? { opacity: 1 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Light for the Dark Age.
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
