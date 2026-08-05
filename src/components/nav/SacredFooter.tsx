'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
  Explore: [
    { href: '/archive', label: 'The Akashic Archive' },
    { href: '/patterns', label: 'Pattern Atlas' },
    { href: '/practice', label: 'Sādhana Instruments' },
    { href: '/method', label: 'The Mirror Method' },
  ],
  Learn: [
    { href: '/research', label: 'Epistemic Sources' },
    { href: '/pricing', label: 'Membership Tiers' },
    { href: '/consultations', label: 'Consultations' },
  ],
};

export function SacredFooter() {
  return (
    <footer className="relative mt-40">
      {/* Cinematic divider */}
      <div className="divider-gold max-w-[1400px] mx-auto" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {/* Brand column */}
          <div>
            <h3 className="font-display text-3xl gold-foil-text mb-6">KALKI</h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs editorial-spacing">
              Where ancient Tantric geometry meets modern computational intelligence.
              Esoteric Intelligence. Sacred Architecture. Pattern Recognition.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="section-label mb-6">{heading}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-gold transition-colors duration-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-20 pt-8 border-t border-gold/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-caption">
            The Architecture of Karma.
          </p>
          <p className="text-caption">
            &copy; {new Date().getFullYear()} KALKI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
