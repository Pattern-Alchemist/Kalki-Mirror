"use client";

interface TimelineEvent {
  auditEvents: { id: string; action: string; entity: string; after: string | null; createdAt: string }[];
  streaks: { practice: string; practiceName: string; currentStreak: number; longestStreak: number; updatedAt: string }[];
  resolutions: { id: string; patternSlug: string; status: string; createdAt: string }[];
  keyUsages: { id: string; inviteCode: string; createdAt: string }[];
}

export function MemberTimeline({ timeline, userId }: { timeline: TimelineEvent; userId: string }) {
  // Merge all events into a unified timeline sorted by date
  const events: { time: string; type: string; label: string; detail: string; color: string }[] = [];

  for (const a of timeline.auditEvents) {
    events.push({
      time: a.createdAt,
      type: 'audit',
      label: a.action,
      detail: a.after || '',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    });
  }
  for (const s of timeline.streaks) {
    events.push({
      time: s.updatedAt,
      type: 'streak',
      label: `${s.practiceName}: ${s.currentStreak} day streak`,
      detail: `Longest: ${s.longestStreak} days`,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    });
  }
  for (const r of timeline.resolutions) {
    events.push({
      time: r.createdAt,
      type: 'pattern',
      label: `Pattern: ${r.patternSlug}`,
      detail: `Status: ${r.status}`,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    });
  }
  for (const k of timeline.keyUsages) {
    events.push({
      time: k.createdAt,
      type: 'key',
      label: `Key redeemed: ${k.inviteCode}`,
      detail: '',
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    });
  }

  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
        Activity Timeline
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-zinc-600">No activity recorded for this member.</p>
      ) : (
        <div className="relative ml-4 space-y-3 border-l-2 border-zinc-800 pl-6">
          {events.slice(0, 25).map((e, i) => (
            <div key={i} className="relative">
              <div className={`absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full border ${e.color}`} />
              <div className="text-xs text-zinc-500">{new Date(e.time).toLocaleString()}</div>
              <div className="mt-0.5 text-sm text-zinc-200">{e.label}</div>
              {e.detail && <div className="mt-0.5 text-xs text-zinc-500">{e.detail}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}