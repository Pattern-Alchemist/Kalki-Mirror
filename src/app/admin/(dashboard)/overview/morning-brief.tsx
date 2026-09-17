'use client';

import { useEffect, useState } from 'react';

// =============================================================
// VOL. 8 #11 — Founder's Morning Brief
// A typewritten summary card at the top of the overview page
// =============================================================

interface BriefData {
  greeting: string;
  leads24h: number;
  bookings: number;
  pendingFollowups: number;
  activeMembers: number;
  draftContent: number;
  pendingConsultations: number;
}

export function MorningBrief() {
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrief = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) return;
        const data = await res.json();
        
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        
        setBrief({
          greeting,
          leads24h: data?.consultations?.pending ?? 0,
          bookings: 0,
          pendingFollowups: 0,
          activeMembers: data?.members?.total ?? 0,
          draftContent: data?.content?.drafts ?? 0,
          pendingConsultations: data?.consultations?.pending ?? 0,
        });
      } catch {
        // fail-soft — just don't show the brief
      } finally {
        setLoading(false);
      }
    };
    fetchBrief();
  }, []);

  if (loading || !brief) return null;

  // Build the summary lines
  const lines: string[] = [];
  if (brief.pendingConsultations > 0) {
    lines.push(`${brief.pendingConsultations} consultation${brief.pendingConsultations === 1 ? '' : 's'} pending your attention`);
  }
  if (brief.draftContent > 0) {
    lines.push(`${brief.draftContent} draft${brief.draftContent === 1 ? '' : 's'} awaiting editorial review`);
  }
  if (brief.activeMembers > 0) {
    lines.push(`${brief.activeMembers} members in the system`);
  }

  return (
    <div className="aw-card p-5 mb-6 relative overflow-hidden" data-tour="overview-brief">
      {/* Scanline effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none aw-scanline" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[var(--aw-cyan)] animate-pulse" style={{ boxShadow: '0 0 8px var(--aw-glow-cyan)' }} />
          <span className="aw-mono text-[10px] uppercase tracking-[0.15em] text-[var(--aw-text-3)]">SYSTEM BRIEF</span>
        </div>
        
        <p className="text-lg font-medium text-[var(--aw-text)] mb-2">
          {brief.greeting}, Kaustubh.
        </p>
        
        {lines.length > 0 ? (
          <p className="text-sm text-[var(--aw-text-2)] leading-relaxed">
            {lines.join(' · ')}.{' '}
            <span className="text-[var(--aw-cyan)]">The system is operational.</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--aw-text-2)] leading-relaxed">
            All clear — no pending items.{' '}
            <span className="text-[var(--aw-cyan)]">The system is operational.</span>
          </p>
        )}
      </div>
    </div>
  );
}
