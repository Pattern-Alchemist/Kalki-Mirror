import { describe, it, expect } from 'vitest';
import { letterOgCardData, buildOgCard, OG_SIZE } from '@/lib/seo/og-factory';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #12 — Letters OG card.
   Each /letters/[slug] gets a bespoke 1200×630 card via the factory.
   The letter's subject is the title; the first 120 chars of the body
   serve as the subtitle. Falls back to a brand card when not found.
   ══════════════════════════════════════════════════════════════ */

describe('letterOgCardData — the card copy builder', () => {
  it('uses the subject as the title', () => {
    const d = letterOgCardData({ subject: 'The Mirror Does Not Flatter', body: 'A long body...' });
    expect(d.title).toBe('The Mirror Does Not Flatter');
  });

  it('uses the first 120 chars of the body as subtitle (whitespace-normalized)', () => {
    const body = 'This is the first sentence.   \n\n  This is the second sentence that goes on for a while to exceed the 120-char limit and get clamped.';
    const d = letterOgCardData({ subject: 'Test', body });
    expect(d.subtitle).toBe(body.replace(/\s+/g, ' ').trim().slice(0, 120));
    expect(d.subtitle!.length).toBeLessThanOrEqual(120);
  });

  it('falls back to the brand subtitle when body is null/empty', () => {
    expect(letterOgCardData({ subject: 'Test', body: null }).subtitle).toBe('A letter from the KALKI broadcast archive.');
    expect(letterOgCardData({ subject: 'Test', body: undefined }).subtitle).toBe('A letter from the KALKI broadcast archive.');
    expect(letterOgCardData({ subject: 'Test', body: '' }).subtitle).toBe('A letter from the KALKI broadcast archive.');
  });

  it('always carries the KALKI · LETTERS label and the brand footer', () => {
    const d = letterOgCardData({ subject: 'X', body: 'Y' });
    expect(d.label).toBe('KALKI · LETTERS');
    expect(d.footer).toBe('EVIDENCE-FIRST TANTRA · KALKI');
  });

  it('handles very long subjects (the factory clamps via ogTitleSize)', () => {
    const longSubject = 'A'.repeat(200);
    const d = letterOgCardData({ subject: longSubject, body: 'Y' });
    expect(d.title).toBe(longSubject); // the factory handles clamping, not the helper
  });
});

describe('buildOgCard — the letter card renders without throwing', () => {
  it('produces a React element for a typical letter', () => {
    const card = buildOgCard(letterOgCardData({
      subject: 'The Mantra That Breathes You',
      body: 'Prana is not the breath. The breath is the vehicle prana rides.',
    }));
    expect(card).toBeDefined();
    expect(card.type).toBeDefined();
  });

  it('produces a React element for a letter with a very long body', () => {
    const card = buildOgCard(letterOgCardData({
      subject: 'Long Letter',
      body: 'X'.repeat(5000),
    }));
    expect(card).toBeDefined();
  });

  it('OG_SIZE is 1200×630 (the standard share card dimensions)', () => {
    expect(OG_SIZE.width).toBe(1200);
    expect(OG_SIZE.height).toBe(630);
  });
});
