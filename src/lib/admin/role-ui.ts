/**
 * A15: Role-based UI visibility.
 * Controls which admin sections each role can see.
 */

export type AdminRole = 'REVIEWER' | 'EDITOR' | 'ADMIN' | 'SUPERADMIN';

export interface NavItem {
  name: string;
  href: string;
  shortcut: string;
  minRole: AdminRole;
}

const ROLE_ORDER: Record<AdminRole, number> = {
  REVIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPERADMIN: 4,
};

/**
 * Full navigation with role visibility.
 * REVIEWER: read-only audit log + overview
 * EDITOR: + content studio
 * ADMIN: + members, keys, consultations, folio
 * SUPERADMIN: + settings (full access)
 */
export const ADMIN_NAV: NavItem[] = [
  { name: 'Overview', href: '/admin/overview', shortcut: '1', minRole: 'REVIEWER' },
  { name: 'War Room', href: '/admin/war-room', shortcut: '0', minRole: 'ADMIN' },
  { name: 'Members', href: '/admin/members', shortcut: '2', minRole: 'ADMIN' },
  { name: 'Golden Keys', href: '/admin/keys', shortcut: '3', minRole: 'ADMIN' },
  { name: 'Content Studio', href: '/admin/content', shortcut: '4', minRole: 'EDITOR' },
  { name: 'Folio Corpus', href: '/admin/folio', shortcut: '5', minRole: 'ADMIN' },
  { name: 'Consultations', href: '/admin/consultations', shortcut: '6', minRole: 'ADMIN' },
  { name: 'Subscribers', href: '/admin/subscribers', shortcut: '', minRole: 'ADMIN' },
  { name: 'Memberships', href: '/admin/memberships', shortcut: '', minRole: 'ADMIN' },
  { name: 'Testimonials', href: '/admin/testimonials', shortcut: '', minRole: 'ADMIN' },
  { name: 'Analytics', href: '/admin/analytics', shortcut: '9', minRole: 'ADMIN' },
  { name: 'Audit Log', href: '/admin/audit', shortcut: '7', minRole: 'REVIEWER' },
  { name: 'Settings', href: '/admin/settings', shortcut: '8', minRole: 'SUPERADMIN' },
];

export function getVisibleNav(role: string): NavItem[] {
  const level = ROLE_ORDER[role as AdminRole] || 0;
  return ADMIN_NAV.filter(item => (ROLE_ORDER[item.minRole] || 0) <= level);
}

export function canAccess(role: string, minRole: AdminRole): boolean {
  return (ROLE_ORDER[role as AdminRole] || 0) >= (ROLE_ORDER[minRole] || 0);
}
