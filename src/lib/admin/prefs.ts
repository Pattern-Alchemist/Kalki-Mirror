// =============================================================
// VOL. 2 #20 — Admin user preferences (server-side DB functions)
// -------------------------------------------------------------
// Per-user prefs stored as JSON in the User.adminPrefs column.
// Hydrated on login by the AdminSessionProvider. Keys:
//   · theme: 'dark' | 'light'
//   · landingPage: '/admin/overview' | '/admin/consultations' | ...
//   · defaultRange: '7' | '30' | '90'  (analytics window)
//   · sidebarCollapsed: boolean
//   · tablePageSize: number (10 | 20 | 50)
//
// Pure constants + parse/serialize live in prefs-shared.ts (client-safe).
// This file is server-only (imports db).
// =============================================================

import { db } from '@/lib/db';
import {
  type AdminPrefs,
  DEFAULT_PREFS,
  parsePrefs,
  serializePrefs,
} from './prefs-shared';

// Re-export the client-safe constants + types so existing imports work
export { DEFAULT_PREFS, parsePrefs, serializePrefs, getLandingPageOptions, type AdminPrefs } from './prefs-shared';

/** Get the admin prefs for a user. */
export async function getAdminPrefs(userId: string): Promise<AdminPrefs> {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { adminPrefs: true },
    });
    return parsePrefs(user?.adminPrefs);
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/** Update the admin prefs for a user. Merges with existing prefs. */
export async function updateAdminPrefs(userId: string, updates: Partial<AdminPrefs>): Promise<AdminPrefs> {
  const existing = await getAdminPrefs(userId);
  const merged = { ...existing, ...updates };
  // Validate
  if (merged.theme && !['dark', 'light'].includes(merged.theme)) {
    throw new Error('Invalid theme');
  }
  if (merged.defaultRange && !['7', '30', '90'].includes(merged.defaultRange)) {
    throw new Error('Invalid defaultRange');
  }
  if (merged.tablePageSize && ![10, 20, 50].includes(merged.tablePageSize)) {
    throw new Error('Invalid tablePageSize');
  }
  await db.user.update({
    where: { id: userId },
    data: { adminPrefs: serializePrefs(merged) },
  });
  return merged;
}
