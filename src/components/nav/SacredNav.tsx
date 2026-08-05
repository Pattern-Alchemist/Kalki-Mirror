'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/archive', label: 'Akasha' },
  { href: '/archetypes', label: 'Archetypes' },
  { href: '/patterns', label: 'Patterns' },
  { href: '/dossier', label: 'Dossier' },
  { href: '/practice', label: 'Sādhana' },
  { href: '/method', label: 'The Method' },
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
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo — Yantra mark + KALKI wordmark */}
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
              <Image
                src="/logo.svg"
                alt="Kalki Yantra"
                width={28}
                height={28}
                className="opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
              <span className="font-display text-lg md:text-xl tracking-[0.25em] gold-foil-text font-light">
                KALKI
              </span>
            </Link>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative text-[0.8125rem] font-ui tracking-[0.18em] uppercase transition-colors duration-500 py-1 neon-tab-glow',
                    isActive(link.href)
                      ? 'text-gold'
                      : 'text-text-muted hover:text-ivory'
                  )}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <motion.span
                      className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"
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

            <div className="relative z-10 flex flex-col justify-center h-full px-10">
              {/* Yantra mark centered at top of menu */}
              <div className="mb-16 flex justify-center">
                <Image
                  src="/logo.svg"
                  alt="Kalki Yantra"
                  width={48}
                  height={48}
                  className="opacity-60"
                />
              </div>
              <nav className="flex flex-col gap-2">
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
                        'font-display text-3xl md:text-4xl tracking-[0.15em] py-2 transition-colors duration-500 font-light neon-tab-glow',
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