"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

// =============================================================
// VOL. 2 #15 — Seeker Journey Timeline
// -------------------------------------------------------------
// Joins events from every surface the seeker has touched:
//   · Memberships (joined, granted, cancelled)
//   · Consultations (submitted, scheduled, completed, outcome)
//   · Keys redeemed (which code, when)
//   · Testimonials given (consented words, featured)
//   · Pattern resolutions (recognized, integrated)
//   · Sadhana streaks (active practices)
//   · Audit events (admin actions affecting this user)
//
// Each event renders as a timeline node with icon + label + time.
// The founder sees the human, not the row.
// =============================================================

interface JourneyEvent {
  ts: string | Date;
  kind: 'membership' | 'consultation' | 'key' | 'testimonial' | 'pattern' | 'streak' | 'audit';
  icon: string;
  label: string;
  detail?: string;
  href?: string;
}

interface SeekerJourney {
  consultations: Array<{
    id: string;
    name: string;
    status: string;
    paymentState: string;
    outcome: string | null;
    createdAt: string;
    completedAt: string | null;
    aiTags: string | null;
  }>;
  memberships: Array<{
    id: string;
    plan: string;
    tier: string;
    status: string;
    utrRef: string | null;
    grantedAt: string | null;
    createdAt: string;
  }>;
  testimonials: Array<{
    id: string;
    quote: string;
    status: string;
    featured: boolean;
    createdAt: string;
  }>;
}

interface TimelineData {
  auditEvents: Array<{ id: string; action: string; createdAt: string }>;
  streaks: Array<{ practice: string; practiceName: string; currentStreak: number; longestStreak: number; updatedAt: string }>;
  keyUsages: Array<{ id: string; inviteCode: { code: string } | null; createdAt: string }>;
}

interface SeekerJourneyTimelineProps {
  seekerJourney?: SeekerJourney;
  timeline?: TimelineData;
}

const KIND_COLOR: Record<string, string> = {
  membership: 'text-violet-400',
  consultation: 'text-blue-400',
  key: 'text-amber-400',
  testimonial: 'text-emerald-400',
  pattern: 'text-rose-400',
  streak: 'text-cyan-400',
  audit: 'text-zinc-400',
};

function timeAgo(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function fmtDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function SeekerJourneyTimeline({ seekerJourney, timeline }: SeekerJourneyTimelineProps) {
  const [showAll, setShowAll] = useState(false);

  // Merge all events into one timeline
  const events = useMemo<JourneyEvent[]>(() => {
    const list: JourneyEvent[] = [];

    if (seekerJourney) {
      for (const m of seekerJourney.memberships) {
        list.push({
          ts: m.createdAt,
          kind: 'membership',
          icon: '💎',
          label: `Membership: ${m.plan} (${m.tier})`,
          detail: `${m.status}${m.grantedAt ? ` · granted ${fmtDate(m.grantedAt)}` : ''}${m.utrRef ? ` · UTR ${m.utrRef}` : ''}`,
          href: '/admin/memberships',
        });
      }
      for (const c of seekerJourney.consultations) {
        const tags = c.aiTags ? (() => { try { return JSON.parse(c.aiTags) as string[]; } catch { return []; } })() : [];
        list.push({
          ts: c.createdAt,
          kind: 'consultation',
          icon: '💬',
          label: `Consultation: ${c.status.toLowerCase()}`,
          detail: `${c.paymentState.toLowerCase()}${c.outcome ? ` · ${c.outcome.toLowerCase()}` : ''}${tags.length ? ` · #${tags.join(' #')}` : ''}${c.completedAt ? ` · completed ${fmtDate(c.completedAt)}` : ''}`,
          href: '/admin/consultations',
        });
      }
      for (const t of seekerJourney.testimonials) {
        list.push({
          ts: t.createdAt,
          kind: 'testimonial',
          icon: '✍️',
          label: `Testimonial: ${t.status.toLowerCase()}${t.featured ? ' ★' : ''}`,
          detail: `"${t.quote.slice(0, 80)}${t.quote.length > 80 ? '…' : ''}"`,
          href: '/admin/testimonials',
        });
      }
    }

    if (timeline) {
      for (const k of timeline.keyUsages) {
        list.push({
          ts: k.createdAt,
          kind: 'key',
          icon: '🔑',
          label: `Redeemed key: ${k.inviteCode?.code ?? '—'}`,
          href: '/admin/keys',
        });
      }
      for (const s of timeline.streaks) {
        list.push({
          ts: s.updatedAt,
          kind: 'streak',
          icon: '🔥',
          label: `Streak: ${s.practiceName} (${s.currentStreak}d current / ${s.longestStreak}d longest)`,
        });
      }
      // Audit events — only show the 5 most recent to keep the timeline readable
      for (const a of timeline.auditEvents.slice(0, 5)) {
        list.push({
          ts: a.createdAt,
          kind: 'audit',
          icon: '·',
          label: `Admin: ${a.action}`,
          href: '/admin/audit',
        });
      }
    }

    return list.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }, [seekerJourney, timeline]);

  const visible = showAll ? events : events.slice(0, 8);

  if (events.length === 0) {
    return (
      <section className="aw-card">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Seeker Journey</h2>
        <p className="mt-2 text-xs text-[var(--aw-text-3)]">No journey events yet. As this seeker engages with consultations, memberships, keys, and testimonials, the timeline will fill in.</p>
      </section>
    );
  }

  return (
    <section className="aw-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
          Seeker Journey — {events.length} event{events.length === 1 ? '' : 's'}
        </h2>
        <span className="text-[10px] text-[var(--aw-text-3)]">Vol. 2 #15</span>
      </div>

      <ol className="mt-4 space-y-3 border-l border-[var(--aw-border-2)]/60 pl-4">
        {visible.map((e, i) => (
          <li key={i} className="relative">
            {/* Timeline dot */}
            <span className={`absolute -left-[21px] top-1.5 h-2 w-2 rounded-full ${KIND_COLOR[e.kind] ?? 'bg-zinc-500'} ring-2 ring-[var(--aw-shell)]`} style={{ backgroundColor: 'currentColor' }} />
            <div className="flex items-start gap-2">
              <span className="text-xs mt-0.5">{e.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-[var(--aw-text)]">
                  {e.href ? (
                    <Link href={e.href} className="hover:text-[var(--aw-cyan)]">{e.label}</Link>
                  ) : e.label}
                </p>
                {e.detail && <p className="mt-0.5 text-[11px] text-[var(--aw-text-2)] line-clamp-2">{e.detail}</p>}
                <p className="mt-0.5 text-[10px] text-[var(--aw-text-3)]">
                  {fmtDate(e.ts)} · {timeAgo(e.ts)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {events.length > 8 && (
        <button
          onClick={() => setShowAll(prev => !prev)}
          className="mt-3 text-xs text-[var(--aw-cyan)] transition hover:text-amber-300"
        >
          {showAll ? 'Show fewer ↑' : `Show ${events.length - 8} more ↓`}
        </button>
      )}
    </section>
  );
}
