"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success';
  time: Date;
  read: boolean;
  href?: string;
}

// A6: In-memory notification store (demo; wire to WebSocket/polling for production)
const notificationStore: Notification[] = [];
let idCounter = 0;

export function pushNotification(n: Omit<Notification, 'id' | 'read' | 'time'>) {
  notificationStore.unshift({
    ...n,
    id: `n-${++idCounter}`,
    read: false,
    time: new Date(),
  });
  // Keep max 50
  if (notificationStore.length > 50) notificationStore.length = 50;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    setNotifications([...notificationStore]);
  }, []);

  // Poll every 10s (replace with WebSocket in production)
  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [refresh]);

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

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = (id: string) => {
    const n = notificationStore.find(n => n.id === id);
    if (n) n.read = true;
    refresh();
  };

  const markAllRead = () => {
    notificationStore.forEach(n => { n.read = true; });
    refresh();
  };

  const handleClick = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  const typeIcon: Record<string, string> = {
    info: 'text-blue-400',
    warning: 'text-amber-400',
    success: 'text-emerald-400',
  };

  const timeAgo = (d: Date) => {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-zinc-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
          <span className="text-sm font-medium text-zinc-200">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-amber-500 hover:text-amber-400"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-zinc-600">No notifications yet.</div>
          ) : (
            notifications.slice(0, 20).map(n => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 transition hover:bg-zinc-800/50 ${!n.read ? 'bg-amber-500/5' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 text-xs ${typeIcon[n.type] || 'text-zinc-500'}`}>
                    {n.type === 'warning' ? '●' : n.type === 'success' ? '●' : '●'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-zinc-300">{n.title}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500 line-clamp-2">{n.body}</p>
                    <p className="mt-1 text-[10px] text-zinc-700">{timeAgo(n.time)}</p>
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
