/**
 * A15: Role-based UI visibility.
 * Controls which admin sections each role can see.
 * Vol. 8 #10: Section grouping for sidebar navigation.
 */

export type AdminRole = 'REVIEWER' | 'EDITOR' | 'ADMIN' | 'SUPERADMIN';

export interface NavItem {
  name: string;
  href: string;
  shortcut: string;
  minRole: AdminRole;
  /** Vol. 8 #10: section grouping */
  section?: 'command' | 'people' | 'craft' | 'system';
  /** Vol. 8 #10: badge count source (fetches from API) */
  badgeSource?: 'pendingConsultations' | 'pendingTestimonials' | 'pendingMemberships' | 'draftContent';
}

const ROLE_ORDER: Record<AdminRole, number> = {
  REVIEWER: 1,
  EDITOR: 2,
  ADMIN: 3,
  SUPERADMIN: 4,
};

export const ADMIN_NAV: NavItem[] = [
  { name: 'Overview', href: '/admin/overview', shortcut: '1', minRole: 'REVIEWER', section: 'command' },
  { name: 'War Room', href: '/admin/war-room', shortcut: '0', minRole: 'ADMIN', section: 'command' },
  { name: 'Consultations', href: '/admin/consultations', shortcut: '6', minRole: 'ADMIN', section: 'people', badgeSource: 'pendingConsultations' },
  { name: 'Members', href: '/admin/members', shortcut: '2', minRole: 'ADMIN', section: 'people' },
  { name: 'Memberships', href: '/admin/memberships', shortcut: '', minRole: 'ADMIN', section: 'people', badgeSource: 'pendingMemberships' },
  { name: 'Subscribers', href: '/admin/subscribers', shortcut: '', minRole: 'ADMIN', section: 'people' },
  { name: 'Golden Keys', href: '/admin/keys', shortcut: '3', minRole: 'ADMIN', section: 'craft' },
  { name: 'Content Studio', href: '/admin/content', shortcut: '4', minRole: 'EDITOR', section: 'craft', badgeSource: 'draftContent' },
  { name: 'Folio Corpus', href: '/admin/folio', shortcut: '5', minRole: 'ADMIN', section: 'craft' },
  { name: 'Broadcast', href: '/admin/broadcast', shortcut: '', minRole: 'ADMIN', section: 'craft' },
  { name: 'Testimonials', href: '/admin/testimonials', shortcut: '', minRole: 'ADMIN', section: 'craft', badgeSource: 'pendingTestimonials' },
  { name: 'Analytics', href: '/admin/analytics', shortcut: '9', minRole: 'ADMIN', section: 'system' },
  { name: 'Audit Log', href: '/admin/audit', shortcut: '7', minRole: 'REVIEWER', section: 'system' },
  { name: 'Settings', href: '/admin/settings', shortcut: '8', minRole: 'SUPERADMIN', section: 'system' },
];

export const NAV_SECTIONS: { id: NavItem['section']; label: string }[] = [
  { id: 'command', label: 'Command' },
  { id: 'people', label: 'People' },
  { id: 'craft', label: 'Craft' },
  { id: 'system', label: 'System' },
];

export function getVisibleNav(role: string): NavItem[] {
  const level = ROLE_ORDER[role as AdminRole] || 0;
  return ADMIN_NAV.filter(item => (ROLE_ORDER[item.minRole] || 0) <= level);
}

export function getVisibleNavGrouped(role: string): Record<string, NavItem[]> {
  const items = getVisibleNav(role);
  const groups: Record<string, NavItem[]> = {};
  for (const item of items) {
    const section = item.section ?? 'system';
    if (!groups[section]) groups[section] = [];
    groups[section].push(item);
  }
  return groups;
}

export function canAccess(role: string, minRole: AdminRole): boolean {
  return (ROLE_ORDER[role as AdminRole] || 0) >= (ROLE_ORDER[minRole] || 0);
}
