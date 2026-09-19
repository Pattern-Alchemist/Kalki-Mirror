'use client';

// Vol. 2 #2 — Thin client wrapper that registers the global admin
// shortcuts. Mounted once in the admin layout. Splitting it out keeps
// the layout as a Server Component.

import { useGlobalAdminShortcuts } from '@/components/admin/keyboard-shortcuts';

export function GlobalShortcutRegistrar() {
  useGlobalAdminShortcuts();
  return null;
}
