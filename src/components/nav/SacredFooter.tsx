'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
  Explore: [
    { href: '/archive', label: 'The Living Archive' },
    { href: '/patterns', label: 'Pattern Atlas' },
    { href: '/practice', label: 'Sādhana Tools' },
    { href: '/method', label: 'The Mirror Method' },
  ],
  Learn: [
    { href: '/research', label: 'Research & Sources' },
    { href: '/pricing', label: 'Membership Tiers' },
    { href: '/consultations', label: 'Consultations' },
  ],
};

export function SacredFooter() {
  return (
    <footer className="bg-deep-black border-t border-gold-subtle mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-gold mb-4">AstroKalki</h3>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              Where tantric heritage meets psychological pattern recognition.
              Scholarly, honest, Indian at its core.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="section-label mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-secondary text-sm hover:text-gold transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-gold-subtle flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-xs tracking-wider">
            Built with scholarly restraint.
          </p>
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} AstroKalki. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}