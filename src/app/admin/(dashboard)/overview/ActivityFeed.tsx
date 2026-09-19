'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminSWR } from '@/components/admin/use-admin-swr';

// =============================================================
// VOL. 2 #8 — Activity Feed
// -------------------------------------------------------------
// A live tail of the last 20 admin actions, shown on the overview
// page. Reads from /api/admin/audit-logs (the existing endpoint),
// surfaces actor + action + target + time-ago. Each entry click-
// through to the audit log with the actor pre-selected.
// =============================================================

interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  actor: { id: string; name: string | null; email: string } | null;
}

interface AuditResponse {
  logs: AuditLogEntry[];
  total: number;
  pages: number;
}

export function ActivityFeed() {
  const [expanded, setExpanded] = useState(false);
  const { data, loading, error } = useAdminSWR<AuditResponse>({
    key: 'admin-activity-feed',
    fetcher: async () => {
      const r = await fetch('/api/admin/audit-logs?page=1');
      if (!r.ok) throw new Error('failed to load activity');
      return r.json();
    },
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  const logs = data?.logs ?? [];
  const visible = expanded ? logs.slice(0, 20) : logs.slice(0, 6);

  // Categorize actions for color coding
  const actionColor = (action: string): string => {
    if (action.includes('create') || action.includes('generate') || action.includes('mint')) return 'text-emerald-400';
    if (action.includes('delete') || action.includes('revoke') || action.includes('bulk.delete')) return 'text-red-400';
    if (action.includes('update') || action.includes('change') || action.includes('tier')) return 'text-amber-400';
    if (action.includes('approve') || action.includes('publish')) return 'text-violet-400';
    if (action.includes('login') || action.includes('session')) return 'text-blue-400';
    return 'text-[var(--aw-text-2)]';
  };

  const entityIcon = (entity: string): string => {
    if (entity === 'User') return '👤';
    if (entity === 'InviteCode') return '🔑';
    if (entity === 'Consultation') return '💬';
    if (entity === 'ContentEntry') return '📄';
    if (entity === 'Testimonial') return '✍️';
    if (entity === 'EmailSubscriber') return '✉️';
    return '•';
  };

  const timeAgo = (iso: string): string => {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
          Recent Activity
        </h2>
        <Link
          href="/admin/audit"
          className="text-xs text-[var(--aw-cyan)] transition hover:text-amber-300"
        >
          View all →
        </Link>
      </div>

      <div className="aw-card overflow-hidden p-0">
        {loading && !data && (
          <div className="px-4 py-6 text-center text-xs text-[var(--aw-text-3)]">Loading activity…</div>
        )}
        {error && (
          <div className="px-4 py-6 text-center text-xs text-red-400">Failed to load activity.</div>
        )}
        {!loading && visible.length === 0 && (
          <div className="px-4 py-6 text-center text-xs text-[var(--aw-text-3)]">
            No admin actions yet. Changes you make will appear here.
          </div>
        )}
        <ul className="divide-y divide-[var(--aw-border-2)]/40">
          {visible.map((log) => (
            <li key={log.id} className="flex items-start gap-3 px-4 py-2.5">
              <span className="mt-0.5 text-xs">{entityIcon(log.entity)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--aw-text-2)]">
                  <span className="font-medium text-[var(--aw-text)]">
                    {log.actor?.name || log.actor?.email?.split('@')[0] || 'Unknown'}
                  </span>{' '}
                  <span className={actionColor(log.action)}>{log.action}</span>
                </p>
                <p className="mt-0.5 text-[10px] text-[var(--aw-text-3)]">
                  {log.entity}{log.entityId ? ` · ${log.entityId.slice(-8)}` : ''}
                </p>
              </div>
              <span className="shrink-0 text-[10px] text-[var(--aw-text-3)]">{timeAgo(log.createdAt)}</span>
            </li>
          ))}
        </ul>

        {logs.length > 6 && (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="w-full border-t border-[var(--aw-border-2)] px-4 py-2 text-xs text-[var(--aw-text-3)] transition hover:bg-[var(--aw-glass-1)] hover:text-[var(--aw-text-2)]"
          >
            {expanded ? 'Show fewer ↑' : `Show ${logs.length - 6} more ↓`}
          </button>
        )}
      </div>
    </section>
  );
}
