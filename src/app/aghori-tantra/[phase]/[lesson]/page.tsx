import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aghoriCourse, COURSE_META } from '@/lib/data/aghori-tantra-course';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';

export const dynamicParams = false;

export function generateStaticParams() {
  return aghoriCourse.flatMap((m) =>
    m.lessons.map((l) => ({ phase: m.id, lesson: l.id }))
  );
}

function locate(phase: string, lesson: string) {
  const mod = aghoriCourse.find((m) => m.id === phase);
  if (!mod) return undefined;
  const lessonIdx = mod.lessons.findIndex((l) => l.id === lesson);
  if (lessonIdx === -1) return undefined;
  return { mod, lesson: mod.lessons[lessonIdx], lessonIdx };
}

export async function generateMetadata({ params }: { params: Promise<{ phase: string; lesson: string }> }): Promise<Metadata> {
  const { phase, lesson } = await params;
  const loc = locate(phase, lesson);
  if (!loc) return { title: 'Not Found' };
  const { mod, lesson: l } = loc;
  const firstPara = l.content.split('\n\n')[0].slice(0, 155);
  return {
    title: `${l.title} — ${mod.phase} | Aghorī Tantra Course`,
    description: firstPara,
    alternates: pageAlternates(`/aghori-tantra/${mod.id}/${l.id}`),
    openGraph: {
      url: canonicalUrl(`/aghori-tantra/${mod.id}/${l.id}`),
      title: `${l.title} | KALKI`,
      description: firstPara,
      images: [{ url: mod.image, width: 1200, height: 630, alt: `${l.title} — Aghorī Tantra Course` }],
    },
  };
}

const EVIDENCE_COLOR: Record<string, string> = {
  TRADITIONAL: 'text-gold',
  ORAL: 'text-copper',
  FIELD: 'text-ivory',
  RECONSTRUCTED: 'text-text-muted',
};

export default async function LessonPage({ params }: { params: Promise<{ phase: string; lesson: string }> }) {
  const { phase, lesson } = await params;
  const loc = locate(phase, lesson);
  if (!loc) notFound();
  const { mod, lesson: l, lessonIdx } = loc;

  const prev = lessonIdx > 0 ? { mod, lesson: mod.lessons[lessonIdx - 1] } : undefined;
  const next = lessonIdx < mod.lessons.length - 1 ? { mod, lesson: mod.lessons[lessonIdx + 1] } : undefined;

  const paragraphs = l.content.split(/\n\n+/);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: l.title,
        description: l.content.split('\n\n')[0].slice(0, 300),
        url: `${SITE_URL}/aghori-tantra/${mod.id}/${l.id}`,
        isPartOf: { '@type': 'Course', name: 'Aghorī Tantra Course', url: `${SITE_URL}/aghori-tantra` },
        about: { '@type': 'Thing', name: 'Aghorī Tantra' },
        inLanguage: 'en',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}` },
          { '@type': 'ListItem', position: 2, name: 'Aghorī Tantra Course', item: `${SITE_URL}/aghori-tantra` },
          { '@type': 'ListItem', position: 3, name: mod.phase, item: `${SITE_URL}/aghori-tantra/${mod.id}` },
          { '@type': 'ListItem', position: 4, name: l.title, item: `${SITE_URL}/aghori-tantra/${mod.id}/${l.id}` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <TrackView event="aghori_lesson_viewed" slug={`${mod.id}/${l.id}`} />
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/aghori-tantra" className="hover:text-gold transition-colors">Aghorī Tantra</Link>
            <span className="mx-2 text-gold/40">/</span>
            <Link href={`/aghori-tantra/${mod.id}`} className="hover:text-gold transition-colors">{mod.phase}</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">Lesson {String(lessonIdx + 1).padStart(2, '0')}</span>
          </nav>

          <header className="mb-12">
            <p className="section-label mb-4">{mod.phase} · {mod.titleSanskrit}</p>
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-[1.05] tracking-[0.04em] engraved-heading font-light mb-3">
              {l.title}
            </h1>
            {l.titleSanskrit && (
              <p className="font-mono text-gold-dim text-sm tracking-[0.12em] mb-6">{l.titleSanskrit}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <span className="glass-chip px-4 py-1.5 font-mono text-[0.8125rem] text-gold tracking-[0.15em] uppercase">
                Lesson {String(lessonIdx + 1).padStart(2, '0')} of {mod.lessons.length}
              </span>
              {l.evidence && (
                <span className={`glass-chip px-4 py-1.5 font-mono text-[0.8125rem] tracking-[0.15em] uppercase ${EVIDENCE_COLOR[l.evidence] || 'text-text-secondary'}`}>
                  {l.evidence}
                </span>
              )}
            </div>
          </header>

          {/* Body */}
          <div className="space-y-8">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-editorial text-foreground/85 leading-relaxed">{p}</p>
            ))}
          </div>

          {/* Practice */}
          {l.practice && (
            <>
              <div className="divider-subtle my-12" />
              <section aria-label="Practice">
                <p className="section-label mb-5">The Practice</p>
                <p className="text-editorial text-foreground/85 leading-relaxed">{l.practice}</p>
              </section>
            </>
          )}

          {/* Mantras */}
          {l.mantras && l.mantras.length > 0 && (
            <>
              <div className="divider-subtle my-12" />
              <section aria-label="Mantras">
                <p className="section-label mb-5">Mantras</p>
                <div className="space-y-5">
                  {l.mantras.map((m, i) => (
                    <div key={i} className="glass-chip px-6 py-5">
                      <p className="font-mono text-gold text-base tracking-[0.06em] mb-2">{m.sanskrit}</p>
                      <p className="font-mono text-xs text-text-muted tracking-[0.08em] mb-3">{m.transliteration}</p>
                      <p className="text-editorial text-foreground/80 text-sm leading-relaxed mb-2">{m.meaning}</p>
                      {m.count && (
                        <p className="font-mono text-xs text-copper tracking-[0.12em] uppercase">Repetition: {m.count}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Materials */}
          {l.materials && l.materials.length > 0 && (
            <>
              <div className="divider-subtle my-12" />
              <section aria-label="Materials">
                <p className="section-label mb-5">Materials</p>
                <ul className="space-y-2">
                  {l.materials.map((m, i) => (
                    <li key={i} className="text-editorial text-foreground/80 leading-relaxed flex gap-3">
                      <span className="text-gold/50" aria-hidden="true">—</span>{m}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Warnings */}
          {l.warnings && l.warnings.length > 0 && (
            <>
              <div className="divider-subtle my-12" />
              <section aria-label="Warnings" className="border border-gold/20 rounded-md px-6 py-6">
                <p className="section-label mb-4 text-copper">Cautions</p>
                <ul className="space-y-3">
                  {l.warnings.map((w, i) => (
                    <li key={i} className="text-editorial text-foreground/80 text-sm leading-relaxed flex gap-3">
                      <span className="text-copper" aria-hidden="true">⚠</span>{w}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {/* Lesson navigation */}
          <div className="divider-subtle my-14" />
          <nav aria-label="Lesson navigation" className="flex flex-col sm:flex-row gap-4 justify-between mb-10">
            {prev ? (
              <Link href={`/aghori-tantra/${mod.id}/${prev.lesson.id}`} className="ghost-cta text-xs text-left max-w-[45%]">
                ← {prev.lesson.title}
              </Link>
            ) : (
              <Link href={`/aghori-tantra/${mod.id}`} className="ghost-cta text-xs text-left max-w-[45%]">
                ← {mod.phase} Index
              </Link>
            )}
            {next ? (
              <Link href={`/aghori-tantra/${mod.id}/${next.lesson.id}`} className="ghost-cta text-xs text-right max-w-[45%]">
                {next.lesson.title} →
              </Link>
            ) : (
              <Link href={`/aghori-tantra/${mod.id}`} className="ghost-cta text-xs text-right max-w-[45%]">
                {mod.phase} Complete — Index →
              </Link>
            )}
          </nav>

          {/* Course footer */}
          <div className="glass-chip px-6 py-6 text-center">
            <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-3">
              {COURSE_META.subtitle}
            </p>
            <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto mb-5">
              This lesson is part of the {COURSE_META.title} course — eight phases, fifty-four lessons,
              from first principles to sealed esoteric practice, with evidence grading throughout.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/aghori-tantra" className="gold-cta text-xs">Course Index</Link>
              <Link href="/archive" className="ghost-cta text-xs">The Akashic Archive</Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
