"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAdminSWR } from "@/components/admin/use-admin-swr";

// =============================================================
// VOL. 2 #7 — Notification Bell (upgraded)
// -------------------------------------------------------------
// The existing bell polled every 15s with setInterval. This upgrade
// uses useAdminSWR (15s refresh + on-focus + on-reconnect) and adds
// the alien-warship visual language. The API contract is unchanged:
//   GET  /api/admin/notifications  → { notifications, unreadCount }
//   PATCH /api/admin/notifications  → { id } | { markAll: true }
// =============================================================

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  href?: string;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const { data, mutate } = useAdminSWR<NotificationsResponse>({
    key: 'admin-notifications',
    fetcher: async () => {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) throw new Error('failed');
      return res.json();
    },
    refreshInterval: 15_000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    mutate();
  }, [mutate]);

  const markAllRead = useCallback(async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    });
    mutate();
  }, [mutate]);

  const handleClick = useCallback((n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.href) router.push(n.href);
  }, [markRead, router]);

  const typeColors: Record<string, string> = {
    info: 'text-blue-400',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
    error: 'text-red-400',
  };

  const typeDot: Record<string, string> = {
    info: 'bg-blue-400',
    warning: 'bg-amber-400',
    success: 'bg-emerald-400',
    error: 'bg-red-400',
  };

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[var(--aw-text-3)] transition hover:bg-[var(--aw-glass-1)] hover:text-[var(--aw-text)]"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black"
            style={{ boxShadow: '0 0 8px var(--aw-glow-cyan)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-[100] mt-2 w-80 rounded-xl border border-[var(--aw-border-2)] bg-[var(--aw-glass-2)] shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--aw-border-2)] px-4 py-3">
            <span className="text-sm font-medium text-[var(--aw-text)]">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-amber-500 transition hover:text-amber-400"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[var(--aw-text-3)]">No notifications yet.</div>
            ) : (
              notifications.slice(0, 20).map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 transition hover:bg-[var(--aw-glass-1)] ${!n.read ? 'bg-[rgba(0,240,255,0.04)]' : ''}`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${typeDot[n.type] || 'bg-zinc-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium ${n.read ? 'text-[var(--aw-text-2)]' : 'text-[var(--aw-text)]'}`}>{n.title}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--aw-text-3)] line-clamp-2">{n.body}</p>
                      <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
