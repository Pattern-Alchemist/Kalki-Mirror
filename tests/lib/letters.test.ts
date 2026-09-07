import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import { letterSlug } from '@/lib/emails/broadcast-content';

/**
 * Vol. 4 #7 — the letters archive. The EmailSend ledger stores only
 * metadata (id/recipient/kind/subject/sentAt) — broadcast BODIES used
 * to evaporate after send, so "an archive from ledger content" was
 * impossible. The fix: sendBroadcast captures the RAW composed body
 * into a Letter row, and /letters renders from that.
 *
 * Pinned here: the slug helper's contract, and the privacy invariants
 * of the capture path (fs-truth style, like the soft-404 audit).
 */

describe('letterSlug', () => {
  it('anchors the subject (diacritics folded, URL-safe) and appends the salt', () => {
    expect(letterSlug('The Mirror Saw Nāḍī Śuddhi', 'abc123')).toBe(
      'the-mirror-saw-nadi-suddhi-abc123'
    );
  });

  it('falls back to "letter" for symbol-only subjects', () => {
    expect(letterSlug('!!!', 's1')).toBe('letter-s1');
  });

  it('caps the base at 60 chars and never ends on a hyphen', () => {
    const slug = letterSlug('A'.repeat(200) + '-', 'tail');
    expect(slug).toBe(`${'a'.repeat(60)}-tail`);
  });

  it('different salts give different slugs (uniqueness rides the salt)', () => {
    expect(letterSlug('Same subject', 'aaa')).not.toBe(letterSlug('Same subject', 'bbb'));
  });

  it('is deterministic for identical inputs', () => {
    expect(letterSlug('Prāṇa', 'x')).toBe(letterSlug('Prāṇa', 'x'));
  });
});

describe('letters privacy invariants (fs truth)', () => {
  const actions = readFileSync(
    join(__dirname, '..', '..', 'src', 'app', 'admin', '(dashboard)', 'broadcast', 'actions.ts'),
    'utf8'
  );

  it('the Letter capture stores the RAW composed body (b), never the per-recipient build', () => {
    const create = actions.match(/db\.letter\.create\(\{[\s\S]*?\}\);/)?.[0] ?? '';
    expect(create).toContain('body: b,');
    expect(create).not.toContain('built.html');
    expect(create).not.toContain('unsubscribeUrl');
  });

  it('the capture is soft-fail (an archive outage never breaks a live delivery)', () => {
    const idx = actions.indexOf('db.letter.create');
    const tail = actions.slice(idx, idx + 400);
    expect(tail).toMatch(/catch\s*\(/);
  });

  it('letters routes document the robots decision in the route header', () => {
    const indexPage = readFileSync(
      join(__dirname, '..', '..', 'src', 'app', 'letters', 'page.tsx'),
      'utf8'
    );
    expect(indexPage).toContain('ROBOTS DECISION');
    expect(indexPage).toContain('index:true');
  });

  it('the per-letter renderer keeps the Vol. 4 #18 soft-404 contract', () => {
    const letterPage = readFileSync(
      join(__dirname, '..', '..', 'src', 'app', 'letters', '[slug]', 'page.tsx'),
      'utf8'
    );
    expect(letterPage).toContain('notFound(');
    expect(letterPage).toContain('robots: { index: false, follow: true }');
  });
});
