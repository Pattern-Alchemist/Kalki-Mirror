// =============================================================
// AUDIT #1 — Legal page shared layout
// -------------------------------------------------------------
// Renders legal content (privacy, terms, refund, disclaimer) with
// consistent styling, a "last updated" stamp, and a sticky table of
// contents for long pages. Server-rendered (no client JS).
// =============================================================

import Link from 'next/link';

export interface LegalSection {
  id: string;
  heading: string;
  body: string[];
}

export interface LegalPageProps {
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, description, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="bg-deep-black min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 md:py-28">
        <Link
          href="/"
          className="inline-block text-text-secondary hover:text-gold transition-colors text-sm tracking-wide mb-8"
        >
          ← Back to KALKI
        </Link>

        <header className="mb-12">
          <p className="section-label mb-4">Legal</p>
          <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight tracking-wide mb-4 hero-heading">
            {title}
          </h1>
          <p className="text-text-secondary text-base editorial-spacing">{description}</p>
          <p className="text-caption mt-4">
            Last updated: {new Date(lastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
          <nav className="hidden lg:block">
            <p className="section-label mb-4">Contents</p>
            <ul className="space-y-2 sticky top-8">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="text-sm text-text-secondary hover:text-gold transition-colors block py-1"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <article className="max-w-3xl">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="mb-12 scroll-mt-8">
                <h2 className="font-display text-xl md:text-2xl text-foreground tracking-wide mb-4">
                  {section.heading}
                </h2>
                {section.body.map((para, i) => (
                  <p key={i} className="text-editorial text-foreground/85 leading-relaxed mb-4">
                    {para}
                  </p>
                ))}
              </section>
            ))}

            <div className="mt-16 pt-8 border-t border-gold/10">
              <p className="section-label mb-4">Other Legal Documents</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { href: '/privacy', label: 'Privacy Policy' },
                  { href: '/terms', label: 'Terms of Service' },
                  { href: '/refund', label: 'Refund Policy' },
                  { href: '/disclaimer', label: 'Disclaimer' },
                ].map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-lg border border-gold/20 px-3 py-1.5 text-xs text-text-secondary hover:text-gold hover:border-gold/40 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
