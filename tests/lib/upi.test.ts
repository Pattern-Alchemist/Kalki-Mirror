import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #17 — revenue rail tests (src/lib/utils/upi.ts)

   The UPI intent URL is the entire payment integration — the VPA,
   amount and currency params are revenue-critical, and the note
   cap protects NPCI field limits. These tests lock the contract.
   ══════════════════════════════════════════════════════════════ */

import { PAID_SESSIONS, buildUpiPayUrl, formatINR, resolveUpiConfig } from '@/lib/utils/upi';

describe('buildUpiPayUrl — NPCI intent contract', () => {
  it('emits pa/pn/am/cu/tn with cu always INR', () => {
    const url = buildUpiPayUrl({ vpa: '8920862931@ibl', payee: 'KALKI', amountINR: 1999, note: 'Pattern Consultation' });
    expect(url).toMatch(/^upi:\/\/pay\?/);
    expect(url).toContain('pa=8920862931%40ibl');
    expect(url).toContain('pn=KALKI');
    expect(url).toContain('am=1999');
    expect(url).toContain('cu=INR');
    expect(url).toContain('tn=');
  });

  it('round-trips through URLSearchParams without corruption', () => {
    const url = buildUpiPayUrl({ vpa: 'founder@upi', payee: 'K', amountINR: 3499, note: 'Shadow Dossier' });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('pa')).toBe('founder@upi');
    expect(params.get('am')).toBe('3499');
    expect(params.get('cu')).toBe('INR');
  });

  it('caps the note at 40 chars (NPCI tn field protection)', () => {
    const url = buildUpiPayUrl({ vpa: 'a@b', payee: 'K', amountINR: 1, note: 'x'.repeat(120) });
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('tn')!.length).toBe(40);
  });

  it('rejects non-positive amounts (never emit a ₹0 or negative collect)', () => {
    expect(() => buildUpiPayUrl({ vpa: 'a@b', payee: 'K', amountINR: 0, note: 'n' })).toThrow();
    expect(() => buildUpiPayUrl({ vpa: 'a@b', payee: 'K', amountINR: -500, note: 'n' })).toThrow();
  });

  it('rejects a VPA missing the @ handle (garbage VPA = money to nobody)', () => {
    expect(() => buildUpiPayUrl({ vpa: 'nohandle', payee: 'K', amountINR: 100, note: 'n' })).toThrow();
  });
});

describe('formatINR + PAID_SESSIONS', () => {
  it('formats with the ₹ sign and Indian digit grouping', () => {
    expect(formatINR(1999)).toBe('₹1,999');
    expect(formatINR(3499)).toBe('₹3,499');
  });

  it('paid sessions carry machine amounts matching the display prices', () => {
    const byslug = Object.fromEntries(PAID_SESSIONS.map((s) => [s.slug, s.amountINR]));
    expect(byslug['practice-consultation']).toBe(1999);
    expect(byslug['shadow-pattern-reading']).toBe(3499);
    expect(PAID_SESSIONS.every((s) => s.amountINR > 0)).toBe(true);
  });
});

describe('resolveUpiConfig — env resolver', () => {
  const ORIG_VPA = process.env.UPI_VPA;
  const ORIG_PAYEE = process.env.UPI_PAYEE;

  afterEach(() => {
    if (ORIG_VPA === undefined) delete process.env.UPI_VPA; else process.env.UPI_VPA = ORIG_VPA;
    if (ORIG_PAYEE === undefined) delete process.env.UPI_PAYEE; else process.env.UPI_PAYEE = ORIG_PAYEE;
  });

  it('returns null when no VPA is set (payment block stays hidden)', () => {
    delete process.env.UPI_VPA;
    delete process.env.UPI_PAYEE;
    expect(resolveUpiConfig()).toBeNull();
  });

  it('reads VPA/PAYEE and falls back the payee to KALKI', () => {
    process.env.UPI_VPA = ' 8920862931@ibl ';
    delete process.env.UPI_PAYEE;
    expect(resolveUpiConfig()).toEqual({ vpa: '8920862931@ibl', payee: 'KALKI' });
    process.env.UPI_PAYEE = 'KAUSTUBH';
    expect(resolveUpiConfig()!.payee).toBe('KAUSTUBH');
  });
});
