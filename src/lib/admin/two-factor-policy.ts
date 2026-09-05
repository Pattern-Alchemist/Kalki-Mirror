/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Vol. 2 #12: 2FA policy for elevated roles
   ---------------------------------------------------------------------------
   TOTP exists and is opt-in (src/lib/admin/two-factor.ts). This module makes
   it MANDATORY for ADMIN/SUPERADMIN with a grace window:

     · elevatedAt  — when the role was granted (tier-7 backfill anchors
                     existing admins at the migration run)
     · GRACE_DAYS  — days after elevation to enroll; 7 chosen so an admin
                     cannot sit on unenrolled elevation past one weekly
                     ops review
     · past due    — admin_plus/superadmin_only surfaces (requireRole)
                     throw TwoFactorRequiredError until enrolled

   Enrollment never locks anyone out: the 2FA section itself and all
   any_staff surfaces stay reachable, so a past-due admin can always reach
   /admin/settings and enroll.
   ═══════════════════════════════════════════════════════════════════════════ */

export const TWO_FA_GRACE_DAYS = 7;

export interface TwoFactorPolicyInput {
  /** Role from the session token. */
  role: string;
  /** Whether TOTP is enrolled and active. */
  twoFactorEnabled: boolean;
  /** When the role was granted. Null on legacy rows the backfill missed. */
  elevatedAt: Date | null;
  /** Wall-clock now — injectable for tests. */
  now?: Date;
}

export interface TwoFactorPolicyResult {
  /** true when the role is ADMIN/SUPERADMIN (2FA regime applies). */
  elevated: boolean;
  /** true when the user is elevated but not yet enrolled. */
  enrollmentNeeded: boolean;
  /** enrollmentNeeded && still inside the grace window. */
  inGrace: boolean;
  /** enrollmentNeeded && past the grace window — access must be denied. */
  pastDue: boolean;
  /** Absolute enrollment deadline (elevatedAt + grace), null when not needed. */
  deadline: Date | null;
}

/**
 * Pure grace-window policy. Null elevatedAt on an elevated, unenrolled user
 * is treated as past due (strictest reading): the backfill stamps every
 * ADMIN/SUPERADMIN row, so a null can only mean tampering or a manual DB
 * edit — deny and surface it rather than silently extending grace forever.
 */
export function twoFactorPolicy(input: TwoFactorPolicyInput): TwoFactorPolicyResult {
  const elevated = input.role === 'ADMIN' || input.role === 'SUPERADMIN';
  const enrollmentNeeded = elevated && !input.twoFactorEnabled;

  if (!enrollmentNeeded) {
    return {
      elevated,
      enrollmentNeeded: false,
      inGrace: false,
      pastDue: false,
      deadline: null,
    };
  }

  const now = input.now ?? new Date();
  if (!input.elevatedAt) {
    return {
      elevated,
      enrollmentNeeded: true,
      inGrace: false,
      pastDue: true,
      deadline: null,
    };
  }

  const deadline = new Date(input.elevatedAt.getTime() + TWO_FA_GRACE_DAYS * 24 * 60 * 60 * 1000);
  const pastDue = now.getTime() >= deadline.getTime();

  return {
    elevated,
    enrollmentNeeded: true,
    inGrace: !pastDue,
    pastDue,
    deadline,
  };
}

/**
 * Thrown by requireRole when an elevated, unenrolled, past-due user touches
 * an admin_plus/superadmin_only surface. The message doubles as the
 * actionable instruction the admin sees in the action error path.
 */
export class TwoFactorRequiredError extends Error {
  readonly code = '2FA_REQUIRED';
  readonly deadline: Date | null;

  constructor(deadline: Date | null) {
    super(
      deadline
        ? `2FA enrollment required — your grace window ended ${deadline.toISOString().slice(0, 10)}. Enroll at /admin/settings → Two-Factor.`
        : '2FA enrollment required for your elevated role. Enroll at /admin/settings → Two-Factor.'
    );
    this.name = 'TwoFactorRequiredError';
    this.deadline = deadline;
  }
}
