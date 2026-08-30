import type { Metadata } from 'next';
import Link from 'next/link';
import {
  EVIDENCE_REGISTERS,
  GUHYA_CASE_FILES,
  GUHYA_CHAMBERS,
  VERDICT_MEANINGS,
  VERDICT_TONES,
  type GuhyaVerdict,
} from '@/lib/data/guhya';

export const metadata: Metadata = {
  title: 'Guhya — The Hidden Files | Occult & Paranormal, Investigated',
  description:
    'KALKI GUHYA: documented occult arts, investigated paranormal case files with published verdicts, and a testimony intake for lived experiences. What was concealed. What was lived. What can be established.',
};

function VerdictBadge({ verdict }: { verdict: GuhyaVerdict }) {
  const tone = VERDICT_TONES[verdict];
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.22em] uppercase"
      style={{
        border: `1px solid ${tone.border}`,
        color: tone.text,
        background: tone.bg,
      }}
    >
      {verdict}
    </span>
  );
}

export default function GuhyaPage() {
  return (
    <main className="bg-deep-black">
      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[70vh] md:min-h-[78vh] flex items-end overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 0,
            backgroundImage:
              'url(https://res.cloudinary.com/b9oo5abp/image/upload/f_auto,q_auto:good,w_1920,c_limit/e_brightness:-30,e_saturation:-20/kalki-mirror/archive/sacred-geometry-manuscript)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Deep archival scrim — the pale manuscript must never sit
            behind gold text. Near-opaque floor, sealed seams. */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.55) 34%, rgba(5,5,5,0.68) 58%, rgba(5,5,5,0.96) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'radial-gradient(115% 85% at 50% 42%, transparent 48%, rgba(5,5,5,0.55) 100%)',
          }}
        />
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pb-16 md:pb-24 pt-32">
          <p className="section-label mb-5">The Field · Prefix GH-</p>
          <h1
            className="font-display text-white uppercase tracking-[0.1em]"
            style={{
              fontSize: 'clamp(3.25rem, 10vw, 7.5rem)',
              lineHeight: 0.95,
              fontWeight: 700,
              textShadow: '0 2px 24px rgba(0,0,0,0.9), 0 0 44px rgba(212,175,55,0.18)',
            }}
          >
            Guhya
          </h1>
          <p
            className="font-ui text-sm md:text-base tracking-[0.3em] uppercase mt-4"
            style={{ color: 'var(--gold-label)', textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}
          >
            The Hidden Files
          </p>
          <p className="text-foreground text-lg md:text-xl max-w-2xl editorial-spacing mt-6" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.8)' }}>
            What was concealed. What was lived. What can be established.
          </p>
        </div>
      </section>

      {/* ═══ THE METHOD ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="max-w-3xl">
            <p className="section-label mb-6">The Evidence Method</p>
            <h2 className="font-display text-2xl md:text-4xl text-white leading-tight tracking-wide mb-8 hero-heading">
              One method, three registers, one verdict — published.
            </h2>
            <p className="text-editorial text-foreground/90 editorial-spacing leading-relaxed mb-10">
              GUHYA is the platform&rsquo;s field division: documented occult arts, investigated
              paranormal claims, and lived experiences — governed by a closed verdict set. Every
              file passes through three registers and closes with exactly one verdict. A platform
              whose product is credibility cannot ship mystery without method.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {EVIDENCE_REGISTERS.map((r) => (
              <div
                key={r.name}
                className="p-7"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.14)',
                  background: 'linear-gradient(160deg, rgba(26,36,54,0.55), rgba(10,10,10,0.65))',
                }}
              >
                <p className="font-display text-xl text-white tracking-[0.14em] uppercase mb-1">{r.name}</p>
                <p
                  className="font-ui text-[0.65rem] tracking-[0.28em] uppercase mb-4"
                  style={{ color: 'var(--gold-label)' }}
                >
                  {r.gloss}
                </p>
                <p className="text-text-muted text-sm leading-relaxed editorial-spacing">{r.line}</p>
              </div>
            ))}
          </div>

          {/* Verdict scale */}
          <div className="mt-12 p-7 md:p-9" style={{ border: '1px solid rgba(212, 175, 55, 0.18)', background: 'rgba(10, 10, 10, 0.55)' }}>
            <p className="section-label mb-6">The Closed Verdict Set</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(VERDICT_MEANINGS) as GuhyaVerdict[]).map((v) => (
                <div key={v}>
                  <VerdictBadge verdict={v} />
                  <p className="text-text-muted text-sm leading-relaxed mt-3">{VERDICT_MEANINGS[v]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10"><div className="divider-gold" /></div>

      {/* ═══ THREE CHAMBERS ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <p className="section-label mb-6 text-center">Three Chambers</p>
          <h2 className="font-display text-2xl md:text-4xl text-white leading-tight tracking-wide mb-14 hero-heading text-center">
            One field. Three doors.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GUHYA_CHAMBERS.map((c) => (
              <div
                key={c.key}
                className="p-8 flex flex-col"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.16)',
                  background: 'linear-gradient(165deg, rgba(26,36,54,0.5), rgba(10,10,10,0.7))',
                }}
              >
                <p
                  className="font-ui text-[0.62rem] tracking-[0.3em] uppercase mb-4"
                  style={{ color: 'var(--gold-label)' }}
                >
                  {c.line}
                </p>
                <p className="font-display text-2xl text-white tracking-[0.08em] mb-5">{c.name}</p>
                <p className="text-foreground/85 text-sm leading-relaxed editorial-spacing flex-1">{c.body}</p>
                <p
                  className="font-ui text-[0.6rem] tracking-[0.22em] uppercase mt-6 pt-5"
                  style={{ color: 'var(--text-muted)', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}
                >
                  {c.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CASE FILES ═══ */}
      <section className="py-16 md:py-24" style={{ background: 'rgba(5, 5, 5, 0.6)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <p className="section-label mb-6">Open Files</p>
          <h2 className="font-display text-2xl md:text-4xl text-white leading-tight tracking-wide mb-14 hero-heading">
            Case files — verdicts included.
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {GUHYA_CASE_FILES.map((f) => (
              <article
                key={f.id}
                className="p-8 md:p-10"
                style={{
                  border: '1px solid rgba(212, 175, 55, 0.16)',
                  background: 'linear-gradient(170deg, rgba(26,36,54,0.45), rgba(10,10,10,0.75))',
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                  <div>
                    <p
                      className="font-mono text-[0.65rem] tracking-[0.28em] uppercase mb-2"
                      style={{ color: 'var(--gold-label)' }}
                    >
                      {f.id} · {f.registers.join(' · ')}
                    </p>
                    <h3 className="font-display text-2xl text-white tracking-[0.06em]">{f.title}</h3>
                  </div>
                  <VerdictBadge verdict={f.verdict} />
                </div>
                <p className="font-ui text-[0.62rem] tracking-[0.2em] uppercase mb-5" style={{ color: 'var(--text-muted)' }}>
                  {f.claimClass} — {f.location} · {f.received}
                </p>
                <p className="text-foreground/90 text-sm leading-relaxed editorial-spacing mb-4">{f.report}</p>
                <p className="text-text-muted text-sm leading-relaxed editorial-spacing">
                  <span style={{ color: 'var(--gold-label)' }}>Finding — </span>
                  {f.finding}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ COMPLIANCE BANNER ═══ */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div
            className="p-7 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4"
            style={{ border: '1px solid rgba(138, 37, 44, 0.4)', background: 'rgba(107, 26, 32, 0.12)' }}
          >
            <p className="font-ui text-[0.65rem] tracking-[0.3em] uppercase whitespace-nowrap" style={{ color: '#c96a70' }}>
              Study, not instruction
            </p>
            <p className="text-text-muted text-sm leading-relaxed editorial-spacing">
              GUHYA documents phenomena and records the arts as history and lineage. It does not
              teach the performance of dangerous practices, and it does not charge for access to
              the Sealed. Tier gates what a member may open; completed readiness gates what a
              seeker has earned. Only the first is commercial.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CLOSING CTA ═══ */}
      <section className="py-20 md:py-28 safe-bottom">
        <div className="max-w-2xl mx-auto px-6 lg:px-10 text-center">
          <p className="section-label mb-6">Bring a Case</p>
          <h2 className="font-display text-2xl md:text-4xl text-white mb-6 hero-heading tracking-wide">
            Lived something you cannot name?
          </h2>
          <p className="text-text-muted text-sm leading-relaxed editorial-spacing mb-10">
            Testimony intake feeds the case pipeline. Every account is read, conflict-mapped, and
            — where the record permits — investigated. Consultations begin where the files end.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/consultations" className="gold-cta">Consult Kaustubh</Link>
            <Link href="/research" className="ghost-cta">The Research Corpus</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
