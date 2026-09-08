// =============================================================
// KALKI — OG IMAGE FACTORY (Vol. 4 #11)
// -------------------------------------------------------------
// 324 pages shared one static card; the richest surfaces (86 lexicon
// terms, 20 patterns, 5 studio shelves) had no bespoke preview. This
// factory is the ONE card design every opengraph-image.tsx route
// renders — brand palette (deep black / gold), the site's display
// serif (Cinzel, committed as a 9KB latin+transliteration subset so
// Sanskrit diacritics like ṃ/ṛ/ā render exactly as the folios do),
// 1200×630.
//
// Pure: builds a Satori-safe React element tree (inline styles only —
// Satori does not process Tailwind). The routes own the data lookup
// and the ImageResponse; the tests own the shape.
//
// Runtime note: the roadmap sketched "edge runtime" — these routes
// run the Node runtime instead, because the committed font file is
// read with fs (no extra origin fetch, no cold-start font race) and
// revalidate still makes every card zero-marginal-cost after the
// first render. Same zero-cost intent, one less failure mode.
// =============================================================

import React from 'react';

export const OG_SIZE = { width: 1200, height: 630 } as const;

/** The committed Cinzel subset (latin + Sanskrit transliteration diacritics). */
export function loadOgFont(): Array<{ name: string; data: Buffer; weight: 500 }> {
  // lazy require keeps this importable from vitest (node env) and the routes alike
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require('node:fs') as typeof import('node:fs');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require('node:path') as typeof import('node:path');
  const data = fs.readFileSync(
    path.join(process.cwd(), 'src', 'app', 'assets', 'og-cinzel-subset.ttf')
  );
  return [{ name: 'Cinzel', data, weight: 500 }];
}

export interface OgCardData {
  /** Eyebrow label, e.g. "KALKI · THE LEXICON" */
  label: string;
  /** The main title — term, pattern name or shelf label. */
  title: string;
  /** One supporting line (definition excerpt / subtitle). */
  subtitle?: string;
  /** Bottom hairline text, e.g. "EVIDENCE-FIRST TANTRA · KALKI". */
  footer: string;
}

/** Word-safe clip with an ellipsis — never mid-glyph. */
export function clampOgText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).replace(/\s+\S*$/, '')}…`;
}

/** Title size steps down as titles grow — Satori rejects overflow. */
export function ogTitleSize(title: string): number {
  if (title.length <= 10) return 128;
  if (title.length <= 18) return 104;
  if (title.length <= 32) return 84;
  return 64;
}

const GOLD = '#D4AF37';
const GOLD_DIM = '#9A7B3A';
const GOLD_BRIGHT = '#E8C855';
const INK = '#F5F5F0';
const BLACK = '#050505';

/**
 * The card. One design, every surface:
 *   eyebrow label (gold-dim, letterspaced) → title (Cinzel, ink) →
 *   optional subtitle (gold-dim) → hairline → footer.
 * A thin gold frame sits 28px inside the 1200×630 canvas.
 */
export function buildOgCard(data: OgCardData): React.ReactElement {
  const title = clampOgText(data.title, 44);
  const subtitle = data.subtitle ? clampOgText(data.subtitle, 96) : undefined;

  return React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: BLACK,
        padding: 56,
        backgroundImage:
          'linear-gradient(135deg, rgba(184,115,51,0.10) 0%, rgba(5,5,5,0) 40%, rgba(212,175,55,0.08) 100%)',
      },
    },
    // gold hairline frame
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 28,
        left: 28,
        right: 28,
        bottom: 28,
        display: 'flex',
        border: `1px solid rgba(212, 175, 55, 0.35)`,
      },
    }),
    // eyebrow
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          fontSize: 26,
          letterSpacing: '0.28em',
          color: GOLD_DIM,
          textTransform: 'uppercase',
        },
      },
      clampOgText(data.label, 48)
    ),
    // centre block
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 22 } },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: ogTitleSize(title),
            lineHeight: 1.04,
            color: INK,
            fontWeight: 500,
          },
        },
        title
      ),
      subtitle &&
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              fontSize: 34,
              lineHeight: 1.35,
              color: GOLD_DIM,
              maxWidth: 940,
            },
          },
          subtitle
        )
    ),
    // footer
    React.createElement(
      'div',
      { style: { display: 'flex', flexDirection: 'column', gap: 18 } },
      React.createElement('div', {
        style: {
          display: 'flex',
          height: 1,
          width: 160,
          backgroundColor: `rgba(212, 175, 55, 0.5)`,
        },
      }),
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            fontSize: 24,
            letterSpacing: '0.22em',
            color: GOLD,
            textTransform: 'uppercase',
          },
        },
        clampOgText(data.footer, 56)
      )
    )
  );
}

/** The ImageResponse options shared by every route (size + the one font). */
export function ogImageResponseOptions(): {
  width: number;
  height: number;
  fonts: Array<{ name: string; data: Buffer; weight: 500 }>;
} {
  return {
    ...OG_SIZE,
    fonts: loadOgFont(),
  };
}

/**
 * USA layer card copy (Vol. 5 #10) — the six /usa pages share one
 * label + footer and use their split h1 / h1Accent sentence pair as
 * the bespoke share copy (big line, then the completion line).
 */
export function usaOgCardData(page: { h1: string; h1Accent?: string }): OgCardData {
  return {
    label: 'KALKI · UNITED STATES',
    title: page.h1,
    subtitle: page.h1Accent,
    footer: 'EVIDENCE-FIRST TANTRA · KALKI',
  };
}

/** Card copy for the studio type shelves (DB-free — brand-level card). */
export const OG_LIBRARY_TYPE_COPY: Record<string, { title: string; subtitle: string }> = {
  practice: { title: 'Sādhana Practice', subtitle: 'Practice notes from the studio corpus — published under the evidence-first discipline.' },
  archetype: { title: 'Archetype Study', subtitle: 'Archetype studies from the studio corpus — the faces reality wears in a life.' },
  pattern: { title: 'Pattern Study', subtitle: 'Pattern studies from the studio corpus — named loops, mapped exits.' },
  research: { title: 'Research Note', subtitle: 'Research notes from the studio corpus — what the sources actually say.' },
  codex: { title: 'Codex Entry', subtitle: 'Codex entries from the studio corpus — the reference shelf.' },
};
