// Dev-only smoke: render the real OG cards through next/og (satori) to
// catch style/overflow errors before they reach Vercel. Run:
//   node scripts/og-smoke.mjs
import { readFileSync } from 'node:fs';
import { ImageResponse } from 'next/og.js';

// Minimal inline replica of the factory card (the factory itself is TS/JSX;
// this smoke exercises the ACTUAL satori pipeline with the ACTUAL font).
const font = readFileSync('src/app/assets/og-cinzel-subset.ttf');

const cases = [
  { label: 'KALKI · THE LEXICON', title: 'Oṃ', subtitle: 'Foundational — The primordial sound — the acoustic signature of the cosmos. Composed of three phonemes representing the waking, dreaming, and deep-sleep states, with the fourth as the silence beyond.', footer: 'EVIDENCE-FIRST TANTRA · KALKI' },
  { label: 'KALKI · PATTERN STUDY', title: 'Kapālabhāti — Skull Shining', subtitle: 'Controlling outcomes to control anxiety', footer: 'EVIDENCE-FIRST TANTRA · KALKI' },
  { label: 'KALKI · THE SĀDHANĀ LIBRARY', title: 'Sādhana Practice', subtitle: 'Practice notes from the studio corpus — published under the evidence-first discipline.', footer: 'EVIDENCE-FIRST TANTRA · KALKI' },
];

function el(type, style, children) {
  return { type, props: { style, children } };
}

for (const [i, c] of cases.entries()) {
  const titleSize = c.title.length <= 10 ? 128 : c.title.length <= 18 ? 104 : c.title.length <= 32 ? 84 : 64;
  const tree = el('div', {
    width: 1200, height: 630, display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', backgroundColor: '#050505', padding: 56,
    backgroundImage: 'linear-gradient(135deg, rgba(184,115,51,0.10) 0%, rgba(5,5,5,0) 40%, rgba(212,175,55,0.08) 100%)',
  }, [
    el('div', { position: 'absolute', top: 28, left: 28, right: 28, bottom: 28, display: 'flex', border: '1px solid rgba(212, 175, 55, 0.35)' }),
    el('div', { display: 'flex', fontSize: 26, letterSpacing: '0.28em', color: '#9A7B3A', textTransform: 'uppercase' }, c.label),
    el('div', { display: 'flex', flexDirection: 'column', gap: 22 }, [
      el('div', { display: 'flex', fontSize: titleSize, lineHeight: 1.04, color: '#F5F5F0', fontWeight: 500 }, c.title),
      el('div', { display: 'flex', fontSize: 34, lineHeight: 1.35, color: '#9A7B3A', maxWidth: 940 }, c.subtitle),
    ]),
    el('div', { display: 'flex', flexDirection: 'column', gap: 18 }, [
      el('div', { display: 'flex', height: 1, width: 160, backgroundColor: 'rgba(212, 175, 55, 0.5)' }),
      el('div', { display: 'flex', fontSize: 24, letterSpacing: '0.22em', color: '#D4AF37', textTransform: 'uppercase' }, c.footer),
    ]),
  ]);

  const res = new ImageResponse(tree, { width: 1200, height: 630, fonts: [{ name: 'Cinzel', data: font, weight: 500 }] });
  const buf = Buffer.from(await res.arrayBuffer());
  const out = `/tmp/og-smoke-${i}.png`;
  (await import('node:fs')).writeFileSync(out, buf);
  console.log(`case ${i}: OK ${buf.length} bytes -> ${out}`);
}
console.log('OG SMOKE PASSED');
