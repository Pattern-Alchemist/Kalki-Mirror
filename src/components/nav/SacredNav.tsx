'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
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
      { href: '/breathwork', label: 'Breathwork' },
      { href: '/sequences', label: 'Sequences' },
      { href: '/library', label: 'Sādhanā Library' },
      { href: '/practice', label: 'Tantra' },
    ],
  },
  {
    label: 'Knowledge',
    links: [
      { href: '/karma', label: 'Karma' },
      { href: '/archetypes', label: 'Archetypes' },
      { href: '/codex', label: 'Codex' },
      { href: '/glossary', label: 'Lexicon' },
      { href: '/method', label: 'The Method' },
      { href: '/research', label: 'Research' },
    ],
  },
  {
    label: 'Deeper',
    links: [
      { href: '/aghori-tantra', label: 'Aghori Tantra' },
      { href: '/consultations', label: 'Consultations' },
      { href: '/dossier', label: 'Dossier' },
      { href: '/pricing', label: 'Membership' },
      { href: '/about', label: 'About' },
    ],
  },
];

/* Links to prefetch — top-visited pages that benefit from instant navigation */
const PREFETCH_LINKS = new Set(['/archive', '/patterns', '/practice', '/pricing']);

export function SacredNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close mobile menu on route change + auto-expand the active group
  // when the menu opens — state adjusted during render (canonical React
  // pattern; avoids setState-in-effect cascading re-renders).
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevOpen, setPrevOpen] = useState(mobileOpen);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }
  if (mobileOpen !== prevOpen) {
    setPrevOpen(mobileOpen);
    if (mobileOpen) {
      for (const g of NAV_GROUPS) {
        if (g.links.some(l => isActive(l.href))) {
          setOpenGroups({ [g.label]: true });
          break;
        }
      }
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  const toggleMenu = () => setMobileOpen(!mobileOpen);
  const toggleGroup = (label: string) => setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));

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

            {/* Desktop — grouped dropdown menus (CSS-only: hover + focus-within, keyboard accessible) */}
            <div className="hidden lg:flex items-center gap-9">
              {NAV_GROUPS.map((group) => {
                const groupActive = group.links.some((l) => isActive(l.href));
                return (
                  <div key={group.label} className="relative group">
                    <button
                      type="button"
                      aria-haspopup="true"
                      className={cn(
                        'relative text-[0.8125rem] font-ui tracking-[0.18em] uppercase transition-colors duration-500 py-1 min-h-[44px] flex items-center gap-1.5 cursor-pointer',
                        groupActive ? 'text-gold' : 'text-text-muted hover:text-ivory'
                      )}
                    >
                      {group.label}
                      <svg
                        className={cn(
                          'w-2 h-2 opacity-60 transition-transform duration-300 group-hover:rotate-180',
                          groupActive && 'rotate-180'
                        )}
                        viewBox="0 0 10 6"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {/* CSS-only active underline */}
                      {groupActive && (
                        <span className="nav-active-underline" aria-hidden="true" />
                      )}
                    </button>
                    {/* Dropdown panel — opens on hover and on keyboard focus */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50 opacity-0 invisible translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                      <div className="glass-nav rounded-md border border-gold/15 shadow-2xl shadow-black/60 py-2 min-w-[230px]">
                        {group.links.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            prefetch={PREFETCH_LINKS.has(link.href)}
                            className={cn(
                              'block px-6 py-2.5 text-[0.8125rem] font-ui tracking-[0.14em] uppercase whitespace-nowrap transition-colors duration-300',
                              isActive(link.href)
                                ? 'text-gold bg-gold/5'
                                : 'text-text-muted hover:text-gold hover:bg-gold/[0.04]'
                            )}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Mobile Full-Screen Menu with Accordion Groups — CSS transitions only */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          'fixed inset-0 z-40 lg:hidden transition-opacity duration-500',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ visibility: mobileOpen ? 'visible' : 'hidden' }}
      >
        <div aria-live="assertive" className="sr-only">
          Navigation menu opened. Press Escape to close.
        </div>
        {/* Textured background */}
        <div
          className="absolute inset-0 bg-deep-black/90"
          aria-hidden="true"
        >
          { }
          <img
            src={`https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1280,c_limit/e_brightness:15/kalki-mirror/auth/dark-texture-bg`}
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
                <div
                  key={group.label}
                  className="nav-accordion-item"
                  style={{ animationDelay: `${0.06 * gi}s` }}
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
                  {/* CSS accordion — replaces framer-motion AnimatePresence */}
                  <div
                    className={cn(
                      'nav-accordion-content overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    )}
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
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-caption text-center pt-8">Light for the Dark Age.</p>
        </div>
      </div>
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