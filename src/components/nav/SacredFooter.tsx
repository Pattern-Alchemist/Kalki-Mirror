'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion/tokens';

const FOOTER_LINKS = {
  Navigate: [
    { href: '/archive', label: 'The Akashic Archive' },
    { href: '/archetypes', label: 'Mahavidya Archetypes' },
    { href: '/patterns', label: 'Pattern Atlas' },
    { href: '/practice', label: 'Sadhana Instruments' },
    { href: '/method', label: 'The Mirror Method' },
    { href: '/codex', label: 'The Kalki Codex' },
  ],
  System: [
    { href: '/research', label: 'Epistemic Sources' },
    { href: '/pricing', label: 'Membership Tiers' },
    { href: '/consultations', label: 'Consultations' },
  ],
};

export function SacredFooter() {
  const reduced = useReducedMotion();

  return (
    <footer className="relative mt-40">
      {/* Atmospheric depth layer */}
      <div className="atmospheric-bg absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

      {/* Cinematic divider with animation */}
      <motion.div
        className="divider-gold max-w-[1400px] mx-auto"
        initial={reduced ? { opacity: 0.3, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 0.3, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: 'center' }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-16"
          initial={reduced ? { opacity: 1 } : staggerContainer.hidden}
          whileInView={reduced ? { opacity: 1 } : staggerContainer.visible}
          viewport={{ once: true, margin: '-40px' }}
        >
          {/* Brand column */}
          <motion.div
            initial={reduced ? { opacity: 1 } : staggerItem.hidden}
            whileInView={reduced ? { opacity: 1 } : staggerItem.visible}
            viewport={{ once: true }}
          >
            <div className="mb-6">
              <h3 className="font-display text-3xl gold-foil-text font-light tracking-[0.2em]">
                KALKI
              </h3>
            </div>
            <p className="text-text-secondary text-base leading-relaxed max-w-xs editorial-spacing">
              Where ancient Tantric geometry meets modern computational intelligence.
              Tantrik Intelligence. Sacred Architecture. Pattern Recognition.
            </p>
            <p className="text-gold-dim text-sm mt-4 tracking-[0.15em] uppercase font-ui">
              The Architecture of Karma.
            </p>
          </motion.div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <motion.div
              key={heading}
              initial={reduced ? { opacity: 1 } : staggerItem.hidden}
              whileInView={reduced ? { opacity: 1 } : staggerItem.visible}
              viewport={{ once: true }}
            >
              <h4 className="section-label mb-6">{heading}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-base hover:text-gold transition-colors duration-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bindu divider */}
        <motion.div
          className="flex justify-center mt-20 mb-16"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-12 h-12 border border-gold/15 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-gold/30 rounded-full" style={{ animation: 'binduPulse 2s ease-in-out infinite' }} />
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          className="pt-8 border-t border-gold/5 flex flex-col md:flex-row justify-between items-center gap-4"
          initial={reduced ? { opacity: 1 } : fadeInUp.hidden}
          whileInView={reduced ? { opacity: 1 } : fadeInUp.visible}
          viewport={{ once: true }}
        >
          <p className="text-caption">
            Ancient Algorithms. Cosmic Law.
          </p>
          <p className="text-caption">
            &copy; 2025 KALKI. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
