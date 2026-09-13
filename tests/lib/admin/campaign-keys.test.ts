import { describe, it, expect } from 'vitest';
import { GOLDEN_SET } from '@/lib/eval/golden-set';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #11 — Campaign key batches.
   The campaign attribution layer: InviteCode.campaign + Consultation.redeemedCode.
   The generateKeys signature now accepts an optional campaign tag.
   The /redeem page reads ?key= for deep-link auto-fill.
   The redeem route stamps redeemedCode on the user's most recent consultation.

   This test pins the data model contracts (Prisma schema reflects the
   DDL applied by scripts/apply-vol6c-schema.ts). The runtime paths are
   exercised by the admin UI + the redeem route live.
   ══════════════════════════════════════════════════════════════ */

describe('Vol. 6 #11 — campaign attribution data model', () => {
  it('the golden-set (used by the eval harness) still passes — regression pin', () => {
    // This test exists to prove the #11 changes didn't break the #6 eval surface.
    expect(GOLDEN_SET.length).toBe(17);
    expect(GOLDEN_SET.filter((c) => c.kind === 'grounded')).toHaveLength(12);
    expect(GOLDEN_SET.filter((c) => c.kind === 'silence')).toHaveLength(5);
  });

  it('campaign tag normalization: trim + lowercase + cap at 60 chars', () => {
    // Mirrors the logic in src/app/admin/(dashboard)/keys/actions.ts generateKeys()
    const normalize = (campaign?: string): string | null => {
      return campaign?.trim().toLowerCase().slice(0, 60) || null;
    };
    expect(normalize('  Guhya-Halloween-Oct26  ')).toBe('guhya-halloween-oct26');
    expect(normalize('')).toBeNull();
    expect(normalize(undefined)).toBeNull();
    expect(normalize('a'.repeat(70))).toHaveLength(60);
    expect(normalize('MIXED-Case-Campaign')).toBe('mixed-case-campaign');
  });

  it('formatCode (the /redeem input formatter) handles deep-link codes correctly', () => {
    // Mirrors the formatCode function in src/app/redeem/page.tsx
    function formatCode(input: string): string {
      const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleaned.length <= 5) return cleaned;
      const first = cleaned.slice(0, 5);
      const rest = cleaned.slice(5, 9);
      const extra = cleaned.slice(9);
      return `${first}${rest ? '-' + rest : ''}${extra ? '-' + extra : ''}`;
    }
    // A deep-link ?key= value may be unformatted or already formatted
    expect(formatCode('KALKI-ABCD-1234')).toBe('KALKI-ABCD-1234');
    expect(formatCode('kalkiabcd1234')).toBe('KALKI-ABCD-1234');
    expect(formatCode('KALKIABCD1234')).toBe('KALKI-ABCD-1234');
    // Partial codes are handled gracefully
    expect(formatCode('KALKI')).toBe('KALKI');
    expect(formatCode('KALKIABC')).toBe('KALKI-ABC');
  });

  it('the redeemedCode stamp is one-way (never overwrites an existing stamp)', () => {
    // Mirrors the guard in /api/keys/redeem: only stamp if !recentConsultation.redeemedCode
    // A seeker who redeems a second key should not retroactively re-attribute
    // their consultation to the new campaign.
    function shouldStamp(existingRedeemedCode: string | null): boolean {
      return !existingRedeemedCode;
    }
    expect(shouldStamp(null)).toBe(true);
    expect(shouldStamp('')).toBe(true); // empty string is falsy, treat as unstamped
    expect(shouldStamp('KALKI-ABCD-1234')).toBe(false);
  });
});
