'use client';

import { useEffect, useState } from 'react';
import { useAdminSWR } from '@/components/admin/use-admin-swr';
import { useAdminLanguage } from '@/components/admin/use-admin-language';

// =============================================================
// VOL. 8 #8 — Topbar HUD Strip
// Persistent status bar: env badge, 2FA status, pending counts, clock
// VOL. 2 #5 — Upgraded to SWR: revalidates every 30s + on focus.
// =============================================================

interface PendingStats {
  pendingConsultations: number;
}

export function TopbarHUD() {
  const [time, setTime] = useState('');

  // Vol. 2 #5 — SWR keeps the pending count live.
  // Refreshes every 30s + on window focus + on reconnect.
  const { data: stats } = useAdminSWR<PendingStats>({
    key: 'hud-pending-stats',
    fetcher: async () => {
      const res = await fetch('/api/admin/stats?summary=pending');
      if (!res.ok) throw new Error('failed');
      const d = await res.json();
      return { pendingConsultations: d.pendingConsultations ?? 0 };
    },
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    // Live clock (IST)
    const updateClock = () => {
      const now = new Date();
      const istTime = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      setTime(istTime + ' IST');
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const isProd = typeof window !== 'undefined' && window.location.hostname === 'www.astrokalki.com';
  const pendingConsultations = stats?.pendingConsultations ?? null;

  return (
    <div className="aw-hud-strip">
      {/* Environment badge */}
      <div className="aw-hud-item">
        <span className={`aw-hud-dot ${isProd ? 'aw-hud-dot--ok' : 'aw-hud-dot--warn'}`} />
        <span>{isProd ? 'PROD' : 'PREVIEW'}</span>
      </div>

      <span className="aw-hud-sep">|</span>

      {/* 2FA status */}
      <div className="aw-hud-item">
        <span className="aw-hud-dot aw-hud-dot--ok" />
        <span>2FA</span>
      </div>

      {/* Pending consultations */}
      {pendingConsultations !== null && pendingConsultations > 0 && (
        <>
          <span className="aw-hud-sep">|</span>
          <div className="aw-hud-item">
            <span className="aw-hud-value">{pendingConsultations}</span>
            <span>pending</span>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Vol. 2 #19 — Language toggle (en ↔ hi) */}
      <LanguageToggle />

      {/* Clock */}
      <div className="aw-hud-item">
        <span className="aw-hud-value">{time}</span>
      </div>
    </div>
  );
}

// Vol. 2 #19 — compact language toggle in the HUD strip
function LanguageToggle() {
  const { lang, toggle } = useAdminLanguage();
  return (
    <button
      onClick={toggle}
      className="aw-hud-item cursor-pointer transition hover:text-[var(--aw-cyan)]"
      title="Toggle admin language (English / हिन्दी)"
      aria-label="Toggle admin language"
    >
      <span className="text-[10px] font-mono uppercase tracking-wider">
        {lang === 'en' ? 'EN' : 'हि'}
      </span>
    </button>
  );
}
