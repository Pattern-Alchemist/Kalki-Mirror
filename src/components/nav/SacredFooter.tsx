import Link from 'next/link';

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
  return (
    <footer className="relative mt-40">
      {/* Cinematic gold divider */}
      <div className="relative">
        <div className="divider-gold max-w-[1400px] mx-auto" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          {/* Brand column */}
          <div>
            <div className="mb-6">
              <h3 className="font-display text-3xl gold-foil-text font-light tracking-[0.2em]">
                KALKI
              </h3>
              <div className="divider-subtle mt-4 mb-5" />
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs editorial-spacing">
              Where ancient Tantric geometry meets modern computational intelligence.
              Tantrik Intelligence. Sacred Architecture. Pattern Recognition.
            </p>
            <p className="text-gold-dim text-[0.7rem] mt-5 tracking-[0.2em] uppercase font-ui">
              The Architecture of Karma.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="section-label mb-6" style={{ fontSize: '0.7rem' }}>{heading}</h4>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-muted text-sm hover:text-gold transition-colors duration-500 tracking-wide"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — minimal and engraved */}
        <div className="mt-20 pt-8 border-t border-gold/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-muted/40 text-[0.7rem] font-mono tracking-[0.15em] uppercase">
            Ancient Algorithms. Cosmic Law.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />
            <p className="text-text-muted/30 text-[0.65rem] font-mono tracking-[0.1em]">
              &copy; 2025 KALKI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
