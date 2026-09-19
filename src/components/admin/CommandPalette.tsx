'use client';

// =============================================================
// VOL. 2 #1 — Command Palette (Cmd+K / Ctrl+K)
// -------------------------------------------------------------
// One palette to navigate anywhere, search any entity, or fire any
// action. Replaces the existing GlobalSearch (which only searched
// entities) with a unified command surface:
//   · ">" prefix → nav items (Overview, Members, Keys, etc.)
//   · "@" prefix → entity search (members, keys, consultations, content)
//   · "!" prefix → actions (Acknowledge all, Mint 5 keys, Compose broadcast)
//   · no prefix → all of the above, ranked by relevance
//
// Triggered by Cmd+K (Mac) / Ctrl+K (Win/Linux) globally.
// Esc to close. ↑↓ to navigate. Enter to execute.
// =============================================================

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { ADMIN_NAV } from '@/lib/admin/role-ui';

interface EntityResult {
  type: 'member' | 'key' | 'content' | 'consultation';
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  group: 'navigate' | 'entity' | 'action';
  icon?: string;
  action: () => void;
}

interface CommandPaletteProps {
  /** Optional callback when an action is fired — used for page-local shortcuts */
  onAction?: (actionId: string) => void;
}

export function CommandPalette({ onAction }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [entities, setEntities] = useState<EntityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
        if (!open) {
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
        setQuery('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setQuery('');
      setEntities([]);
      setActiveIndex(0);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced entity search — only when query doesn't start with '>' or '!'
  useEffect(() => {
    const q = query.trim();
    if (!q || q.startsWith('>') || q.startsWith('!')) {
      setEntities([]);
      return;
    }
    const searchQuery = q.startsWith('@') ? q.slice(1).trim() : q;
    if (searchQuery.length < 2) {
      setEntities([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setEntities(data.results || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }, 250);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Build the command list based on the query
  const commands = useMemo<CommandItem[]>(() => {
    const q = query.trim().toLowerCase();
    const items: CommandItem[] = [];

    // Navigate items — always shown if query is empty, '>' prefix filters to nav only
    if (!q || q.startsWith('>')) {
      const navQuery = q.startsWith('>') ? q.slice(1).trim() : q;
      for (const nav of ADMIN_NAV) {
        if (!navQuery || nav.name.toLowerCase().includes(navQuery) || nav.href.toLowerCase().includes(navQuery)) {
          items.push({
            id: `nav-${nav.href}`,
            label: nav.name,
            hint: nav.href,
            group: 'navigate',
            icon: '→',
            action: () => { router.push(nav.href); setOpen(false); },
          });
        }
      }
    }

    // Actions — shown if query is empty, '!' prefix filters to actions only
    if (!q || q.startsWith('!')) {
      const actionQuery = q.startsWith('!') ? q.slice(1).trim() : q;
      const actions = buildActions(router, pathname, onAction);
      for (const a of actions) {
        if (!actionQuery || a.label.toLowerCase().includes(actionQuery)) {
          items.push(a);
        }
      }
    }

    // Entity results — shown if query doesn't start with '>' or '!'
    if (!q || (!q.startsWith('>') && !q.startsWith('!'))) {
      for (const e of entities) {
        items.push({
          id: `entity-${e.type}-${e.id}`,
          label: e.title,
          hint: e.subtitle,
          group: 'entity',
          icon: e.type === 'member' ? '👤' : e.type === 'key' ? '🔑' : e.type === 'consultation' ? '💬' : '📄',
          action: () => { router.push(e.href); setOpen(false); },
        });
      }
    }

    return items.slice(0, 30); // cap to keep the palette snappy
  }, [query, entities, router, pathname, onAction]);

  // Reset active index when commands change
  useEffect(() => {
    setActiveIndex(0);
  }, [commands]);

  // Keyboard navigation within the palette
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, commands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = commands[activeIndex];
      if (cmd) cmd.action();
    }
  }, [commands, activeIndex]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const active = listRef.current.querySelector(`[data-idx="${activeIndex}"]`);
    if (active && 'scrollIntoView' in active) {
      (active as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!open) return null;

  const groupColor: Record<string, string> = {
    navigate: 'text-[var(--aw-cyan)]',
    entity: 'text-[var(--aw-text-2)]',
    action: 'text-amber-300',
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] bg-black/70 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--aw-border-2)] bg-[var(--aw-glass-2)] shadow-2xl backdrop-blur-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Input row */}
        <div className="flex items-center border-b border-[var(--aw-border-2)] px-4 py-3 gap-3">
          <svg className="h-4 w-4 text-[var(--aw-text-3)] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search…  > navigate  @ entity  ! action"
            className="w-full bg-transparent text-sm text-[var(--aw-text)] placeholder-[var(--aw-text-3)] outline-none"
            autoFocus
          />
          {loading && (
            <svg className="h-4 w-4 animate-spin text-[var(--aw-text-3)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {commands.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-[var(--aw-text-3)]">
              {query ? `No matches for "${query}"` : 'Start typing — or use >, @, ! prefixes'}
            </div>
          )}
          {commands.map((cmd, idx) => (
            <button
              key={cmd.id}
              data-idx={idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={cmd.action}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                idx === activeIndex ? 'bg-[var(--aw-glass-1)]' : ''
              }`}
            >
              <span className="w-5 shrink-0 text-center text-xs text-[var(--aw-text-3)]">{cmd.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-[var(--aw-text)] truncate">{cmd.label}</p>
                {cmd.hint && <p className="text-[11px] text-[var(--aw-text-3)] truncate">{cmd.hint}</p>}
              </div>
              <span className={`shrink-0 text-[10px] uppercase tracking-wider ${groupColor[cmd.group]}`}>
                {cmd.group}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--aw-border-2)] px-4 py-2 flex items-center justify-between text-[10px] text-[var(--aw-text-3)]">
          <span>
            <kbd className="rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-1 py-0.5">↑↓</kbd> navigate
            <span className="mx-2">·</span>
            <kbd className="rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-1 py-0.5">Enter</kbd> select
          </span>
          <span>
            <kbd className="rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-1 py-0.5">Esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Action builders — page-local + global
// =============================================================

function buildActions(
  router: ReturnType<typeof useRouter>,
  pathname: string | null,
  onAction?: (actionId: string) => void,
): CommandItem[] {
  const actions: CommandItem[] = [
    {
      id: 'action-mint-keys',
      label: 'Mint 5 Golden Keys',
      hint: 'Batch-mint with campaign tag',
      group: 'action',
      icon: '🔑',
      action: () => { router.push('/admin/keys'); setOpenCallback(onAction, 'mint-keys'); },
    },
    {
      id: 'action-new-testimonial',
      label: 'Enter new testimonial',
      hint: 'Paste from WhatsApp',
      group: 'action',
      icon: '💬',
      action: () => { router.push('/admin/testimonials'); setOpenCallback(onAction, 'new-testimonial'); },
    },
    {
      id: 'action-compose-broadcast',
      label: 'Compose broadcast',
      hint: 'AI Magic Compose',
      group: 'action',
      icon: '✉️',
      action: () => { router.push('/admin/broadcast'); },
    },
    {
      id: 'action-new-letter',
      label: 'Draft new letter',
      hint: 'Content studio',
      group: 'action',
      icon: '✍️',
      action: () => { router.push('/admin/content'); },
    },
    {
      id: 'action-ack-all',
      label: 'Acknowledge all pending consultations',
      hint: 'Bulk move NEW → ACKNOWLEDGED',
      group: 'action',
      icon: '✓',
      action: () => { router.push('/admin/consultations'); setOpenCallback(onAction, 'ack-all'); },
    },
    {
      id: 'action-toggle-theme',
      label: 'Toggle light/dark theme',
      group: 'action',
      icon: '◐',
      action: () => {
        const root = document.documentElement;
        const current = root.classList.contains('light');
        root.classList.toggle('light', !current);
        try { localStorage.setItem('aw-theme', !current ? 'light' : 'dark'); } catch { /* ignore */ }
      },
    },
    {
      id: 'action-help',
      label: 'Show keyboard shortcuts',
      hint: 'Opens help slide-over',
      group: 'action',
      icon: '?',
      action: () => {
        // Dispatch a custom event the TourProvider listens for
        window.dispatchEvent(new CustomEvent('kalki-admin-help'));
      },
    },
  ];

  return actions;
}

function setOpenCallback(cb: ((id: string) => void) | undefined, id: string) {
  // Defer so the palette closes before the action fires
  setTimeout(() => cb?.(id), 100);
}
