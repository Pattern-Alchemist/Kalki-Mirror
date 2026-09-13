import { describe, it, expect } from 'vitest';
import { isStaleConsultation, STALE_THRESHOLD_H } from '@/lib/ops/completion-nudge';
import { buildCompletionNudgeEmail, COMPLETION_NUDGE_PATH } from '@/lib/emails/completion-nudge';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #14 — Consultation outcome loop.
   The stale detector: a consultation NEW > 48h without closure is
   "stale" and gets one nudge. The doctrine: the first real
   consultation cannot fall through the floor.
   ══════════════════════════════════════════════════════════════ */

const NOW = new Date('2026-09-13T12:00:00Z');
const HOURS_AGO = (h: number) => new Date(NOW.getTime() - h * 3_600_000);

describe('isStaleConsultation — the stale detector', () => {
  it('returns true for a NEW consultation > 48h old with no outcome', () => {
    expect(isStaleConsultation({
      status: 'NEW',
      outcome: null,
      createdAt: HOURS_AGO(50),
      completedAt: null,
    }, NOW)).toBe(true);
  });

  it('returns true for a NEW consultation exactly at the 48h threshold', () => {
    expect(isStaleConsultation({
      status: 'NEW',
      outcome: null,
      createdAt: HOURS_AGO(48),
      completedAt: null,
    }, NOW)).toBe(true);
  });

  it('returns false for a NEW consultation < 48h old (not yet stale)', () => {
    expect(isStaleConsultation({
      status: 'NEW',
      outcome: null,
      createdAt: HOURS_AGO(47),
      completedAt: null,
    }, NOW)).toBe(false);
  });

  it('returns false for a CANCELLED consultation (closed, not stale)', () => {
    expect(isStaleConsultation({
      status: 'CANCELLED',
      outcome: null,
      createdAt: HOURS_AGO(100),
      completedAt: null,
    }, NOW)).toBe(false);
  });

  it('returns false for a consultation with completedAt set (the outcome writer closed it)', () => {
    expect(isStaleConsultation({
      status: 'SCHEDULED',
      outcome: 'PENDING',
      createdAt: HOURS_AGO(100),
      completedAt: HOURS_AGO(10),
    }, NOW)).toBe(false);
  });

  it('returns false for a RESOLVED consultation (terminal outcome)', () => {
    expect(isStaleConsultation({
      status: 'COMPLETED',
      outcome: 'RESOLVED',
      createdAt: HOURS_AGO(100),
      completedAt: null,
    }, NOW)).toBe(false);
  });

  it('returns false for a DISCONTINUED consultation (terminal outcome)', () => {
    expect(isStaleConsultation({
      status: 'COMPLETED',
      outcome: 'DISCONTINUED',
      createdAt: HOURS_AGO(100),
      completedAt: null,
    }, NOW)).toBe(false);
  });

  it('returns true for a PENDING outcome that is > 48h old (still open)', () => {
    expect(isStaleConsultation({
      status: 'ACKNOWLEDGED',
      outcome: 'PENDING',
      createdAt: HOURS_AGO(72),
      completedAt: null,
    }, NOW)).toBe(true);
  });

  it('returns true for an IN_PROGRESS outcome that is > 48h old (still open)', () => {
    expect(isStaleConsultation({
      status: 'SCHEDULED',
      outcome: 'IN_PROGRESS',
      createdAt: HOURS_AGO(72),
      completedAt: null,
    }, NOW)).toBe(true);
  });

  it('STALE_THRESHOLD_H is 48 (the doctrine: 2 days without closure)', () => {
    expect(STALE_THRESHOLD_H).toBe(48);
  });
});

describe('buildCompletionNudgeEmail — the nudge template', () => {
  it('uses the first name in the greeting', () => {
    const e = buildCompletionNudgeEmail({
      name: 'Kaustubh Lokhande',
      context: 'Pattern reading',
      siteUrl: 'https://www.astrokalki.com',
    });
    expect(e.text).toContain('Namaste Kaustubh,');
  });

  it('falls back to "there" when name is empty', () => {
    const e = buildCompletionNudgeEmail({
      name: '',
      context: null,
      siteUrl: 'https://www.astrokalki.com',
    });
    expect(e.text).toContain('Namaste there,');
  });

  it('includes the context line when provided', () => {
    const e = buildCompletionNudgeEmail({
      name: 'Alice',
      context: 'Pattern reading for the witness archetype',
      siteUrl: 'https://www.astrokalki.com',
    });
    expect(e.text).toContain('You reached out about "Pattern reading');
  });

  it('falls back to a generic context line when not provided', () => {
    const e = buildCompletionNudgeEmail({
      name: 'Alice',
      context: null,
      siteUrl: 'https://www.astrokalki.com',
    });
    expect(e.text).toContain('You reached out for a consultation.');
  });

  it('includes the deep-link to /consultations', () => {
    const e = buildCompletionNudgeEmail({
      name: 'Alice',
      context: null,
      siteUrl: 'https://www.astrokalki.com',
    });
    expect(e.text).toContain('https://www.astrokalki.com/consultations');
    expect(e.html).toContain('href="https://www.astrokalki.com/consultations"');
  });

  it('subject is the doctrine: "three minutes to close the loop?"', () => {
    const e = buildCompletionNudgeEmail({
      name: 'Alice',
      context: null,
      siteUrl: 'https://www.astrokalki.com',
    });
    expect(e.subject).toMatch(/three minutes.*close the loop/);
  });

  it('COMPLETION_NUDGE_PATH is /consultations (the re-engage surface)', () => {
    expect(COMPLETION_NUDGE_PATH).toBe('/consultations');
  });

  it('clamps very long context to 80 chars in the email body', () => {
    const longContext = 'A'.repeat(200);
    const e = buildCompletionNudgeEmail({
      name: 'Alice',
      context: longContext,
      siteUrl: 'https://www.astrokalki.com',
    });
    // The text body includes the context, clamped to 80 chars
    expect(e.text).toContain('A'.repeat(80));
    expect(e.text).not.toContain('A'.repeat(81));
  });
});
