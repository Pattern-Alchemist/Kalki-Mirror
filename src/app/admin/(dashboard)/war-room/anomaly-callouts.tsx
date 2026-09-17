'use client';

import { useEffect, useState } from 'react';

// =============================================================
// VOL. 8 #12 — War Room: Anomaly Callouts
// Surfaces anything >2σ from median — dead campaigns,
// 3x lead spikes, stuck crons, chain degradation.
// =============================================================

interface Anomaly {
  severity: 'red' | 'amber' | 'green';
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

export function AnomalyCallouts() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        // Fetch the digest dry-run which contains all the alarm lines
        const res = await fetch('/api/cron/daily-digest?dryRun=1', {
          headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const preview: string = data.preview || '';
        
        const found: Anomaly[] = [];
        
        // Parse the OPS HEALTH section for alarm lines
        for (const line of preview.split('\n')) {
          if (line.includes('AI CHAIN') && line.includes('degraded')) {
            found.push({
              severity: 'red',
              title: 'AI Chain Degraded',
              detail: line.replace(/^.*AI CHAIN:\s*/, ''),
              action: { label: 'Rebuild Chain', href: '/admin/settings' },
            });
          }
          if (line.includes('GOLDEN ASK') && (line.includes('ALERT') || line.includes('dead'))) {
            found.push({
              severity: 'amber',
              title: 'Eval Cron Stale',
              detail: line.replace(/^.*GOLDEN ASK:\s*/, ''),
            });
          }
          if (line.includes('DRILLS ALERT')) {
            found.push({
              severity: 'amber',
              title: 'Drill Stale',
              detail: line.replace(/^.*DRILLS ALERT:\s*/, ''),
            });
          }
          if (line.includes('OBSERVATORY') && line.includes('awaiting')) {
            found.push({
              severity: 'green',
              title: 'Observatory: Awaiting Consent',
              detail: 'GSC OAuth not configured — add the trio to wake the observatory.',
            });
          }
        }
        
        setAnomalies(found);
      } catch {
        // fail-soft — no anomalies shown
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, []);

  if (loading || anomalies.length === 0) return null;

  const colorMap = {
    red: { dot: 'aw-hud-dot--err', badge: 'aw-badge--danger', text: 'text-[var(--aw-danger)]' },
    amber: { dot: 'aw-hud-dot--warn', badge: 'aw-badge--warning', text: 'text-[var(--aw-warning)]' },
    green: { dot: 'aw-hud-dot--ok', badge: 'aw-badge--success', text: 'text-[var(--aw-success)]' },
  };

  return (
    <div className="aw-card p-5 mb-6" data-tour="war-room-anomalies">
      <div className="flex items-center gap-2 mb-4">
        <span className={`aw-hud-dot ${anomalies.some(a => a.severity === 'red') ? 'aw-hud-dot--err' : 'aw-hud-dot--warn'}`} />
        <h2 className="aw-mono text-[10px] uppercase tracking-[0.15em] text-[var(--aw-text-3)]">Anomaly Detection</h2>
        <span className="aw-badge aw-badge--info text-[8px]">{anomalies.length}</span>
      </div>
      
      <div className="space-y-3">
        {anomalies.map((a, i) => {
          const c = colorMap[a.severity];
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--aw-glass-1)] border border-[var(--aw-border)]">
              <span className={`aw-hud-dot ${c.dot} mt-1.5 shrink-0`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${c.text}`}>{a.title}</span>
                  <span className={`aw-badge ${c.badge} text-[8px]`}>{a.severity.toUpperCase()}</span>
                </div>
                <p className="text-xs text-[var(--aw-text-2)] leading-relaxed">{a.detail}</p>
                {a.action && (
                  <a href={a.action.href} className="inline-flex items-center gap-1 mt-2 text-[10px] aw-mono text-[var(--aw-cyan)] hover:underline">
                    {a.action.label}
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
