'use client';

// =============================================================
// VOL. 2 #2 — Keyboard shortcuts layer
// -------------------------------------------------------------
// A composable shortcut registry. Page-local shortcuts stack on top
// of global ones without conflict. Shortcuts are:
//   · Single-digit (1-9, 0) — jump to nav page (legacy)
//   · ?                       — open help slide-over
//   · /                       — focus the first input on the page
//   · g then <key>            — vim-style "go to" (gg=overview, gm=members, etc.)
//   · Cmd+/                   — show the keyboard cheat-sheet (help slide-over)
//
// Page-local shortcuts (consultations, testimonials, etc.) are
// registered via the useAdminShortcuts hook. They check that no
// input/textarea is focused before firing.
// =============================================================

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutBinding {
  key: string;
  description: string;
  /** Ctrl/Cmd required — defaults to false */
  ctrl?: boolean;
  /** Shift required — defaults to false */
  shift?: boolean;
  /** Alt required — defaults to false */
  alt?: boolean;
  handler: () => void;
}

/**
 * Detect if the user is typing in an input/textarea/contentEditable.
 * Used to suppress shortcuts when the user is in a text field.
 */
export function isTypingInField(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = (el.tagName || '').toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || Boolean(el.isContentEditable);
}

/**
 * useAdminShortcuts — register page-local keyboard shortcuts.
 * Pass an array of bindings; they're active only while the component
 * is mounted. When an input/textarea is focused, all shortcuts are
 * suppressed except those with ctrl=true.
 */
export function useAdminShortcuts(bindings: ShortcutBinding[]): void {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const typing = isTypingInField();
      // If the user is typing, only fire ctrl-based shortcuts
      if (typing && !e.metaKey && !e.ctrlKey) return;

      for (const b of bindingsRef.current) {
        // Modifier matching — exact match (don't fire if extra modifiers held)
        const wantsCtrl = b.ctrl ?? false;
        const wantsShift = b.shift ?? false;
        const wantsAlt = b.alt ?? false;
        const hasCtrl = e.metaKey || e.ctrlKey;
        const hasShift = e.shiftKey;
        const hasAlt = e.altKey;

        if (wantsCtrl !== hasCtrl) continue;
        if (wantsShift !== hasShift) continue;
        if (wantsAlt !== hasAlt) continue;

        if (e.key.toLowerCase() === b.key.toLowerCase()) {
          e.preventDefault();
          b.handler();
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

/**
 * useGlobalAdminShortcuts — registered once in the admin layout.
 * Handles the "always-on" shortcuts: single-digit nav, ?, /, g-prefix.
 */
export function useGlobalAdminShortcuts(): void {
  // Single-press "g-prefix" mode: press g, then the next keystroke
  // within 800ms is interpreted as a go-to target.
  const gPressedAt = useRef<number>(0);

  const go = useCallback((href: string) => {
    window.location.href = href;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd+/ opens the help slide-over (cheat sheet)
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('kalki-admin-help'));
        return;
      }

      // If typing in a field, skip the rest
      if (isTypingInField()) return;
      // If a modifier is held, skip the rest (let Command Palette etc. handle it)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // g-prefix: g then a second key within 800ms
      if (e.key.toLowerCase() === 'g' && !e.shiftKey) {
        gPressedAt.current = Date.now();
        return;
      }
      if (gPressedAt.current && Date.now() - gPressedAt.current < 800) {
        const map: Record<string, string> = {
          'o': '/admin/overview',
          'w': '/admin/war-room',
          'c': '/admin/consultations',
          'm': '/admin/members',
          'k': '/admin/keys',
          'f': '/admin/folio',
          's': '/admin/content',
          't': '/admin/testimonials',
          'b': '/admin/broadcast',
          'a': '/admin/audit',
          'n': '/admin/analytics',
          'e': '/admin/settings',
        };
        const href = map[e.key.toLowerCase()];
        if (href) {
          e.preventDefault();
          gPressedAt.current = 0;
          go(href);
          return;
        }
        gPressedAt.current = 0;
      }

      // ? opens help
      if (e.key === '?') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('kalki-admin-help'));
        return;
      }

      // / focuses the first input
      if (e.key === '/') {
        const firstInput = document.querySelector('input[type="text"], input[type="search"], textarea') as HTMLElement | null;
        if (firstInput) {
          e.preventDefault();
          firstInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);
}

// =============================================================
// SHORTCUTS reference — exported for the help slide-over to render
// =============================================================

export interface ShortcutDoc {
  keys: string[];
  label: string;
  group: 'global' | 'page' | 'action';
}

export const GLOBAL_SHORTCUTS: ShortcutDoc[] = [
  { keys: ['Cmd', 'K'], label: 'Open command palette', group: 'global' },
  { keys: ['Cmd', '/'], label: 'Show keyboard cheat-sheet', group: 'global' },
  { keys: ['?'], label: 'Show help slide-over', group: 'global' },
  { keys: ['/'], label: 'Focus first input on page', group: 'global' },
  { keys: ['g', 'o'], label: 'Go to Overview', group: 'global' },
  { keys: ['g', 'w'], label: 'Go to War Room', group: 'global' },
  { keys: ['g', 'c'], label: 'Go to Consultations', group: 'global' },
  { keys: ['g', 'm'], label: 'Go to Members', group: 'global' },
  { keys: ['g', 'k'], label: 'Go to Golden Keys', group: 'global' },
  { keys: ['g', 's'], label: 'Go to Content Studio', group: 'global' },
  { keys: ['g', 't'], label: 'Go to Testimonials', group: 'global' },
  { keys: ['g', 'b'], label: 'Go to Broadcast', group: 'global' },
  { keys: ['g', 'a'], label: 'Go to Audit Log', group: 'global' },
];

export const CONSULTATION_SHORTCUTS: ShortcutDoc[] = [
  { keys: ['a'], label: 'Acknowledge selected consultation', group: 'page' },
  { keys: ['n'], label: 'Add a note to selected consultation', group: 'page' },
  { keys: ['s'], label: 'Schedule selected consultation', group: 'page' },
  { keys: ['c'], label: 'Mark selected complete', group: 'page' },
  { keys: ['x'], label: 'Cancel selected', group: 'page' },
];

export const TESTIMONIAL_SHORTCUTS: ShortcutDoc[] = [
  { keys: ['a'], label: 'Approve selected testimonial', group: 'page' },
  { keys: ['h'], label: 'Hide selected testimonial', group: 'page' },
  { keys: ['f'], label: 'Toggle featured', group: 'page' },
];

export const CONTENT_SHORTCUTS: ShortcutDoc[] = [
  { keys: ['Cmd', 's'], label: 'Save draft (autosave also fires on change)', group: 'page' },
  { keys: ['Cmd', 'p'], label: 'Preview the current draft', group: 'page' },
];
