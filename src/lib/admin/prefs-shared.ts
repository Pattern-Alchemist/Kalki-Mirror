// =============================================================
// VOL. 2 #20 — Admin user preferences (client-safe constants)
// -------------------------------------------------------------
// Pure constants + functions only — no DB imports. Safe to import
// from client components. The DB-touching functions live in
// src/lib/admin/prefs.ts (server-only).
// =============================================================

export interface AdminPrefs {
  theme?: 'dark' | 'light';
  landingPage?: string;
  defaultRange?: '7' | '30' | '90';
  sidebarCollapsed?: boolean;
  tablePageSize?: 10 | 20 | 50;
}

export const DEFAULT_PREFS: AdminPrefs = {
  theme: 'dark',
  landingPage: '/admin/overview',
  defaultRange: '30',
  sidebarCollapsed: false,
  tablePageSize: 20,
};

const LANDING_PAGE_OPTIONS = [
  { value: '/admin/overview', label: 'Overview' },
  { value: '/admin/consultations', label: 'Consultations' },
  { value: '/admin/members', label: 'Members' },
  { value: '/admin/keys', label: 'Golden Keys' },
  { value: '/admin/war-room', label: 'War Room' },
  { value: '/admin/content', label: 'Content Studio' },
  { value: '/admin/analytics', label: 'Analytics' },
];

export function getLandingPageOptions() {
  return LANDING_PAGE_OPTIONS;
}

/** Parse the JSON prefs string from the DB. Fail-soft returns defaults. */
export function parsePrefs(json: string | null | undefined): AdminPrefs {
  if (!json) return { ...DEFAULT_PREFS };
  try {
    const parsed = JSON.parse(json) as Partial<AdminPrefs>;
    return { ...DEFAULT_PREFS, ...parsed };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/** Serialize prefs to a JSON string for the DB. */
export function serializePrefs(prefs: AdminPrefs): string {
  return JSON.stringify(prefs);
}
