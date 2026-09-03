import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aghoriCourse, COURSE_META } from '@/lib/data/aghori-tantra-course';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';
import CaptureBand from '@/components/capture/CaptureBand';

export const dynamicParams = false;

export function generateStaticParams() {
  return aghoriCourse.map((m) => ({ phase: m.id }));
}

function getModule(phase: string) {
  return aghoriCourse.find((m) => m.id === phase);
}

export async function generateMetadata({ params }: { params: Promise<{ phase: string }> }): Promise<Metadata> {
  const { phase } = await params;
  const mod = getModule(phase);
  if (!mod) return { title: 'Not Found' };
  return {
    title: `${mod.phase}: ${mod.title} | Aghorī Tantra Course`,
    description: mod.description.slice(0, 155),
    alternates: pageAlternates(`/aghori-tantra/${mod.id}`),
    openGraph: {
      url: canonicalUrl(`/aghori-tantra/${mod.id}`),
      title: `${mod.phase} — ${mod.title} | KALKI`,
      description: mod.description.slice(0, 155),
      images: [{ url: mod.image, width: 1200, height: 630, alt: `${mod.title} — Aghorī Tantra Course` }],
    },
  };
}

export default async function PhasePage({ params }: { params: Promise<{ phase: string }> }) {
  const { phase } = await params;
  const mod = getModule(phase);
  if (!mod) notFound();

  const idx = aghoriCourse.findIndex((m) => m.id === phase);
  const prev = idx > 0 ? aghoriCourse[idx - 1] : undefined;
  const next = idx < aghoriCourse.length - 1 ? aghoriCourse[idx + 1] : undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: `Aghorī Tantra Course — ${mod.phase}: ${mod.title}`,
        description: mod.description.slice(0, 300),
        url: `${SITE_URL}/aghori-tantra/${mod.id}`,
        provider: { '@id': `${SITE_URL}/#organization` },
        isPartOf: { '@type': 'Course', name: 'Aghorī Tantra Course', url: `${SITE_URL}/aghori-tantra` },
        educationalLevel: mod.difficulty,
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
          { '@type': 'ListItem', position: 2, name: 'Aghorī Tantra Course', item: `${SITE_URL}/aghori-tantra` },
          { '@type': 'ListItem', position: 3, name: mod.phase, item: `${SITE_URL}/aghori-tantra/${mod.id}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <TrackView event="aghori_phase_viewed" slug={mod.id} />
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/aghori-tantra" className="hover:text-gold transition-colors">Aghorī Tantra</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{mod.phase}</span>
          </nav>

          <header className="mb-14">
            <p className="section-label mb-4">{mod.phase} · {mod.lessons.length} Lessons</p>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground leading-[1.02] tracking-[0.04em] engraved-heading font-light mb-4">
              {mod.title}
            </h1>
            <p className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-8">{mod.titleSanskrit}</p>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-gold tracking-[0.15em] uppercase">{mod.phase}</span>
              <span className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-text-secondary tracking-[0.15em] uppercase">{mod.difficulty}</span>
              <span className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-text-secondary tracking-[0.15em] uppercase">{mod.duration}</span>
            </div>
            <p className="text-editorial text-foreground/80 leading-relaxed max-w-3xl">{mod.description}</p>
          </header>

          <div className="divider-subtle mb-14" />

          {/* Lesson index */}
          <section aria-label="Lessons in this phase">
            <p className="section-label mb-8">The Lessons</p>
            <ol className="space-y-4">
              {mod.lessons.map((lesson, i) => (
                <li key={lesson.id}>
                  <Link
                    href={`/aghori-tantra/${mod.id}/${lesson.id}`}
                    className="group block glass-chip px-6 py-5 hover:border-gold/30 transition-colors duration-500"
                  >
                    <div className="flex items-baseline justify-between gap-4 mb-1.5">
                      <span className="font-mono text-xs text-gold-dim tracking-[0.15em]">Lesson {String(i + 1).padStart(2, '0')}</span>
                      {lesson.evidence && (
                        <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase text-text-muted">{lesson.evidence}</span>
                      )}
                    </div>
                    <h2 className="text-lg text-foreground group-hover:text-gold transition-colors duration-500 leading-snug">
                      {lesson.title}
                    </h2>
                    {lesson.titleSanskrit && (
                      <p className="font-mono text-xs text-text-muted mt-1 tracking-[0.08em]">{lesson.titleSanskrit}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Phase navigation */}
          <div className="divider-subtle my-14" />
          <nav aria-label="Phase navigation" className="flex flex-col sm:flex-row gap-4 justify-between">
            {prev ? (
              <Link href={`/aghori-tantra/${prev.id}`} className="ghost-cta text-xs text-left">
                ← {prev.phase}: {prev.titleSanskrit}
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/aghori-tantra/${next.id}`} className="ghost-cta text-xs text-right">
                {next.phase}: {next.titleSanskrit} →
              </Link>
            ) : (
              <Link href="/aghori-tantra" className="ghost-cta text-xs text-right">
                {COURSE_META.title} — Course Index →
              </Link>
            )}
          </nav>

          <CaptureBand topic={`aghori-phase:${phase}`} className="mt-14" />
        </div>
      </div>
    </>
  );
}
