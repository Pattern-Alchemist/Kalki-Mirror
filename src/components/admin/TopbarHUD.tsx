'use client';

import { useEffect, useState } from 'react';

// =============================================================
// VOL. 8 #8 — Topbar HUD Strip
// Persistent status bar: env badge, 2FA status, pending counts, clock
// =============================================================

export function TopbarHUD() {
  const [time, setTime] = useState('');
  const [pendingConsultations, setPendingConsultations] = useState<number | null>(null);

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

    // Fetch pending consultations count (fail-soft)
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/admin/stats?summary=pending');
        if (res.ok) {
          const data = await res.json();
          setPendingConsultations(data.pendingConsultations ?? 0);
        }
      } catch {
        // fail-soft — don't show the count
      }
    };
    fetchPending();
    const pendingInterval = setInterval(fetchPending, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(pendingInterval);
    };
  }, []);

  const isProd = typeof window !== 'undefined' && window.location.hostname === 'www.astrokalki.com';

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

      {/* Clock */}
      <div className="aw-hud-item">
        <span className="aw-hud-value">{time}</span>
      </div>
    </div>
  );
}
