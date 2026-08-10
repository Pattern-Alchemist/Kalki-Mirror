import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
 */
export async function requireRole(level: RoleLevel = 'any_staff'): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('Unauthorized');

  const role = (session.user as unknown as { role: string }).role;
  const allowed = LEVEL_ROLES[level];

  if (!allowed.includes(role)) {
    throw new Error(`Forbidden: requires ${level.replace('_', ' ')}`);
  }

  return (session.user as unknown as { id: string }).id;
}

/**
 * Check if the user's role meets a minimum level.
 */
export function roleGte(role: string, minimum: string): boolean {
  return (ROLE_HIERARCHY[role] || 0) >= (ROLE_HIERARCHY[minimum] || 0);
}
