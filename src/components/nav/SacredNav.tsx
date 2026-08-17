'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { cn } from '@/lib/utils';

/* Navigation structure with mobile-first grouping */
interface NavGroup {
  label: string;
  links: { href: string; label: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Practice',
    links: [
      { href: '/archive', label: 'Akashic' },
      { href: '/patterns', label: 'Patterns' },
      { href: '/practice', label: 'Tantra' },
    ],
  },
  {
    label: 'Knowledge',
    links: [
      { href: '/archetypes', label: 'Archetypes' },
      { href: '/codex', label: 'Codex' },
      { href: '/method', label: 'The Method' },
      { href: '/research', label: 'Research' },
    ],
  },
  {
    label: 'Deeper',
    links: [
      { href: '/aghori-tantra', label: 'Aghori Tantra' },
      { href: '/dossier', label: 'Dossier' },
      { href: '/pricing', label: 'Membership' },
    ],
  },
];

// Flat list for desktop
const NAV_LINKS = NAV_GROUPS.flatMap(g => g.links);

/* Links to prefetch — top-visited pages that benefit from instant navigation */
const PREFETCH_LINKS = new Set(['/archive', '/patterns', '/practice', '/pricing']);

export function SacredNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const reduced = useNativeReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Body scroll lock + inert on main content
  useEffect(() => {
    const main = document.getElementById('main-content');
    const footer = document.querySelector('footer');
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      main?.setAttribute('aria-hidden', 'true');
      main?.setAttribute('inert', '');
      footer?.setAttribute('aria-hidden', 'true');
      footer?.setAttribute('inert', '');
      const timer = setTimeout(() => {
        const firstLink = menuRef.current?.querySelector('a');
        firstLink?.focus();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = '';
      main?.removeAttribute('aria-hidden');
      main?.removeAttribute('inert');
      footer?.removeAttribute('aria-hidden');
      footer?.removeAttribute('inert');
      toggleRef.current?.focus();
    }
  }, [mobileOpen]);

  // Focus trap
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!mobileOpen || !menuRef.current) return;
    if (e.key === 'Escape') { setMobileOpen(false); return; }
    if (e.key !== 'Tab') return;
    const focusable = menuRef.current.querySelectorAll<HTMLElement>('a[href], button, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }, [mobileOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const toggleMenu = () => setMobileOpen(!mobileOpen);
  const toggleGroup = (label: string) => setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

  // Auto-expand the group containing the active link
  useEffect(() => {
    if (!mobileOpen) return;
    for (const g of NAV_GROUPS) {
      if (g.links.some(l => isActive(l.href))) {
        setOpenGroups({ [g.label]: true });
        break;
      }
    }
  }, [pathname, mobileOpen]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-700',
          scrolled ? 'glass-nav' : 'bg-transparent'
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="relative z-10 flex items-center gap-3 group">
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
                  prefetch={PREFETCH_LINKS.has(link.href)}
                  className={cn(
                    'relative text-[0.8125rem] font-ui tracking-[0.18em] uppercase transition-colors duration-500 py-1 min-h-[44px] flex items-center neon-tab-glow',
                    isActive(link.href) ? 'text-gold' : 'text-text-muted hover:text-ivory'
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
              ref={toggleRef}
              className="lg:hidden relative z-10 w-11 h-11 flex items-center justify-center"
              onClick={toggleMenu}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-5 h-4">
                <span className={cn('absolute left-0 h-px bg-gold transition-all duration-500', mobileOpen ? 'top-1/2 w-5 -translate-y-1/2 rotate-45' : 'top-0 w-4')} />
                <span className={cn('absolute left-0 top-1/2 h-px bg-gold transition-all duration-500', mobileOpen ? 'opacity-0 w-0' : 'w-5 -translate-y-1/2')} />
                <span className={cn('absolute left-0 h-px bg-gold transition-all duration-500', mobileOpen ? 'top-1/2 w-5 -translate-y-1/2 -rotate-45' : 'bottom-0 w-3')} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Full-Screen Menu with Accordion Groups */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed inset-0 z-40 lg:hidden"
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div aria-live="assertive" className="sr-only">
              Navigation menu opened. Press Escape to close.
            </div>
            {/* Textured background — dark stone with subtle depth */}
            <div
              className="absolute inset-0 bg-deep-black/90"
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1280,c_limit/e_brightness:0.15/kalki-mirror/auth/dark-texture-bg`}
                alt=""
                className="w-full h-full object-cover opacity-30"
                draggable={false}
              />
            </div>
            <div className="absolute inset-0 bg-deep-black/60 backdrop-blur-2xl" />

            <div className="relative z-10 flex flex-col h-full px-6 py-20 safe-area-x overflow-y-auto">
              <div className="mb-8 flex justify-center">
                <span className="font-display text-3xl tracking-[0.3em] gold-foil-text font-light">KALKI</span>
              </div>

              <div className="flex flex-col gap-2 flex-1">
                {NAV_GROUPS.map((group, gi) => {
                  const isOpen = !!openGroups[group.label];
                  const hasActive = group.links.some(l => isActive(l.href));
                  return (
                    <motion.div
                      key={group.label}
                      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: reduced ? 0 : 0.06 * gi, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.label)}
                        aria-expanded={isOpen}
                        className={cn(
                          'flex w-full items-center justify-between py-3 px-1 text-xs font-ui uppercase tracking-[0.2em] transition-colors duration-300 min-h-[44px]',
                          hasActive ? 'text-gold' : 'text-text-muted/60 hover:text-text-muted'
                        )}
                      >
                        {group.label}
                        <ChevronIcon open={isOpen} />
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pl-3 pb-1 flex flex-col gap-0.5">
                              {group.links.map((link) => (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  prefetch={false}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    'block py-3 pl-3 border-l text-lg tracking-[0.08em] font-light transition-all duration-300 min-h-[44px] leading-[44px]',
                                    isActive(link.href)
                                      ? 'text-gold font-display border-gold/30'
                                      : 'text-text-muted hover:text-ivory border-text-muted/10'
                                  )}
                                >
                                  {link.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-caption text-center pt-8">Light for the Dark Age.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={cn('h-3.5 w-3.5 transition-transform duration-300', open && 'rotate-180')}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}
