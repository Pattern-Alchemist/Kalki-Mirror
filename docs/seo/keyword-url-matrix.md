# KALKI — Keyword-to-URL Matrix (spec §8)

> Purpose: enforce the one-page-per-query-family rule. No two pages may compete
> for the same primary query. Before publishing ANY new page, add it here and
> verify the family is unclaimed. Reviewed at each content wave.

## Commercial families (transactional / commercial investigation)

| Query family | Primary URL | Secondary / support | Notes |
|---|---|---|---|
| vedic astrology consultation (US) | `/usa/vedic-astrology-consultation` | `/consultations` | `/consultations` stays canonical for global/brand consult intent |
| online vedic astrologer (how to choose) | `/usa/online-vedic-astrologer` | `/method` | buyer-guide angle; passes to checklist page |
| kundli reading / birth chart reading | `/usa/kundli-birth-chart-reading` | `/glossary` | kundli-matching question defers to relationship page |
| relationship astrology / repeating relationships (commercial) | `/usa/relationship-pattern-reading` | `/patterns` | informational variants belong to Atlas |
| spiritual consultation / sadhana guidance | `/usa/spiritual-consultation` | `/consultations`, `/archive` | |
| membership / pricing | `/pricing` | — | untouched |

## Informational families (owned surfaces)

| Query family | Primary URL | Notes |
|---|---|---|
| what is tantra (+ history, texts, meaning) | `/tantra` + `/tantra/what-is-tantra` | hub is overview; child is the definitional deep-dive |
| tantric meditation / how does tantra work | `/tantra/tantric-meditation` | |
| tantra vs yoga / difference between tantra and yoga | `/tantra/tantra-and-yoga` | comparison family |
| shakta tantra / goddess tradition | `/tantra/shakta-tantra` | |
| kashmiri shaivism / trika / spanda / pratyabhijna | `/tantra/kashmiri-shaivism` | |
| what is karma / karma meaning / karma and relationships | `/karma` | hub covers; NO child pages built (thin-page risk) |
| why do I keep [pattern] / self-sabotage / people pleasing etc. | `/patterns/[slug]` (20 folios) | the spec's "Layer C" — already built, keep owned here |
| [mahavidya name] — who is / symbolism / mantra meaning | `/archetypes/[id]` (10 folios) | each folio carries FAQ for the long-tail of its deity |
| glossary / sanskrit terms | `/glossary` | untouched |
| siddhi / specific sadhana practices | `/archive/[slug]` | untouched |
| what is aghori / aghori course | `/aghori-tantra` | course pitch stays here |
| email course (brand) | `/email-course` | |

## Deliberately NOT built (anti-thin decisions)

- `/karma/karmic-debt`, `/karma/karma-vs-fate` … — the `/karma` hub + Atlas already
  answer these; child pages would be thin duplications. Revisit only if GSC shows
  the hub ranking 11–20 on a specific sub-question with meaningful impressions.
- `/mahavidyas/*` as a SEPARATE namespace — would cannibalize `/archetypes/*`.
  The Mahāvidyā depth lives under `/archetypes/[id]`.
- City-level US pages (`/usa/astrologer-new-york` …) — spec §1/§28 prohibition.
- Any `/usa/*` page beyond the 6 shipped — stage. Next wave only after the first
  wave's GSC data (impressions > 0 on ≥ 3 of 6) lands.

## Rules for the next wave

1. One new page = one unclaimed family. Check this file first.
2. Commercial pages get `Service` + `FAQPage` + `BreadcrumbList` JSON-LD, USD
   pricing, dual CTA (Ten Doors + attributed WhatsApp).
3. Informational pages carry explicit evidence registers; contested claims labeled.
4. Every new page enters: sitemap (priority 0.7–0.85), llms.txt, footer or hub
   internal links, and one contextual link from an established page.
5. `SITE_LASTMOD` bumps only with meaningful content change.
