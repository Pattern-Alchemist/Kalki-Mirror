/**
 * Tier-3 ② — the public testimonial wall (roadmap #12).
 *
 * Renders ONLY rows the archivist has approved and the seeker has
 * consented to. Given zero rows it renders nothing at all — no empty
 * shells, no placeholder praise. Everything here is real or absent.
 */

import type { PublicTestimonial } from "@/lib/data/testimonials";

export function TestimonialWall({ testimonials }: { testimonials: PublicTestimonial[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="relative py-24 md:py-32" aria-labelledby="testimonials-heading">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <p className="section-label mb-4 text-center">Returned from the fire</p>
        <h2
          id="testimonials-heading"
          className="font-display text-3xl md:text-5xl text-white text-center mb-4 hero-heading tracking-wide"
        >
          Words from those who sat with the mirror
        </h2>
        <p className="text-foreground/60 text-center max-w-2xl mx-auto mb-14 editorial-spacing">
          Seeker accounts, shared with consent after the work. Published only when the archivist
          and the seeker both agree — nothing curated for polish, everything given freely.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.id}
              className="relative flex flex-col rounded-sm border border-gold-dim/20 bg-white/[0.02] p-6 md:p-8 transition-colors hover:border-gold-dim/40"
            >
              <span aria-hidden="true" className="font-display text-4xl leading-none text-gold/30 select-none">
                &ldquo;
              </span>
              <blockquote className="mt-2 flex-1 text-foreground/80 text-[0.9375rem] leading-relaxed editorial-spacing">
                {t.quote}
              </blockquote>
              <figcaption className="mt-6 pt-4 border-t border-gold-dim/15">
                <p className="font-display text-sm text-gold">{t.name || "Anonymous seeker"}</p>
                {(t.context || t.location) && (
                  <p className="mt-0.5 text-[0.6875rem] uppercase tracking-widest text-text-muted">
                    {[t.context, t.location].filter(Boolean).join(" · ")}
                  </p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
