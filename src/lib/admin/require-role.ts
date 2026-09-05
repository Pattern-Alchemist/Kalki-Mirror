import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { twoFactorPolicy, TwoFactorRequiredError } from "./two-factor-policy";

type RoleLevel = 'any_staff' | 'editor_plus' | 'admin_plus' | 'superadmin_only';

const ROLE_HIERARCHY: Record<string, number> = {
  REVIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPERADMIN: 4,
};

const LEVEL_ROLES: Record<RoleLevel, string[]> = {
  any_staff: ['REVIEWER', 'EDITOR', 'ADMIN', 'SUPERADMIN'],
  editor_plus: ['EDITOR', 'ADMIN', 'SUPERADMIN'],
  admin_plus: ['ADMIN', 'SUPERADMIN'],
  superadmin_only: ['SUPERADMIN'],
};

/**
 * Verifies the current user has the required role level.
 * Returns the user ID on success, throws on failure.
 *
 * Vol. 2 #12 — elevated surfaces (admin_plus / superadmin_only) additionally
 * enforce the 2FA policy: an ADMIN/SUPERADMIN who never enrolled and whose
 * grace window has passed throws TwoFactorRequiredError until enrolled.
 * Enrollment surfaces stay any_staff, so the fix is always reachable.
 */
export async function requireRole(level: RoleLevel = 'any_staff'): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const role = (session.user as unknown as { role: string }).role;
  const allowed = LEVEL_ROLES[level];

  if (!allowed.includes(role)) {
    throw new Error(`Forbidden: requires ${level.replace('_', ' ')}`);
  }

  const userId = (session.user as unknown as { id: string }).id;

  if (level === 'admin_plus' || level === 'superadmin_only') {
    const user = await db.user
      .findUnique({
        where: { id: userId },
        select: { twoFactorEnabled: true, elevatedAt: true },
      })
      .catch(() => null);

    if (user) {
      const policy = twoFactorPolicy({
        role,
        twoFactorEnabled: user.twoFactorEnabled,
        elevatedAt: user.elevatedAt,
      });
      if (policy.pastDue) throw new TwoFactorRequiredError(policy.deadline);
    }
    // user row unreadable → fail open to the role check alone; the
    // authentic role gate above already held. Never brick ops on a
    // transient DB read.
  }

  return userId;
}

/**
 * Check if the user's role meets a minimum level.
 */
export function roleGte(role: string, minimum: string): boolean {
  return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[minimum] || 0);
}
