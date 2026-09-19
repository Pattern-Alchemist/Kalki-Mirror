"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminSWR } from "@/components/admin/use-admin-swr";
import { getLandingPageOptions } from "@/lib/admin/prefs-shared";

// =============================================================
// VOL. 2 #20 — Admin Preferences page
// -------------------------------------------------------------
// Per-user prefs: theme, landing page, default analytics range,
// sidebar collapsed state, table page size. Persisted to the
// User.adminPrefs JSON column via /api/admin/prefs.
// =============================================================

interface AdminPrefs {
  theme?: 'dark' | 'light';
  landingPage?: string;
  defaultRange?: '7' | '30' | '90';
  sidebarCollapsed?: boolean;
  tablePageSize?: 10 | 20 | 50;
}

interface PrefsResponse {
  prefs: AdminPrefs;
}

export default function PreferencesPage() {
  const { data, mutate } = useAdminSWR<PrefsResponse>({
    key: 'admin-prefs',
    fetcher: async () => {
      const r = await fetch('/api/admin/prefs');
      if (!r.ok) throw new Error('Failed to load prefs');
      return r.json();
    },
    refreshInterval: 0,
    revalidateOnFocus: false,
  });

  const [localPrefs, setLocalPrefs] = useState<AdminPrefs>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [err, setErr] = useState("");

  // Hydrate local state when server data arrives
  useEffect(() => {
    if (data?.prefs) {
      setLocalPrefs(data.prefs);
    }
  }, [data]);

  const onSave = useCallback(async () => {
    setSaving(true);
    setErr(""); setNotice("");
    try {
      const r = await fetch('/api/admin/prefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localPrefs),
      });
      if (!r.ok) throw new Error('Save failed');
      setNotice('Preferences saved. They apply on your next login.');
      await mutate();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally { setSaving(false); }
  }, [localPrefs, mutate]);

  const landingOptions = getLandingPageOptions();
  const prefs = { ...localPrefs };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Preferences</h1>
        <p className="mt-1 text-sm text-[var(--aw-text-2)]">
          Your admin UI preferences. Saved per-user. Applied on your next login.
        </p>
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}
      {notice && <p className="text-emerald-400 text-sm">{notice}</p>}

      {/* Theme */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Theme</h2>
        <div className="mt-3 flex gap-2">
          {(['dark', 'light'] as const).map(t => (
            <button
              key={t}
              onClick={() => setLocalPrefs(p => ({ ...p, theme: t }))}
              className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                prefs.theme === t
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-[var(--aw-border-2)] text-[var(--aw-text-2)] hover:text-[var(--aw-text)]'
              }`}
            >
              {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
            </button>
          ))}
        </div>
      </section>

      {/* Landing page */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Default Landing Page</h2>
        <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
          The page you see first when you open /admin (after auth).
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {landingOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setLocalPrefs(p => ({ ...p, landingPage: opt.value }))}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                prefs.landingPage === opt.value
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-[var(--aw-border-2)] text-[var(--aw-text-2)] hover:text-[var(--aw-text)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Default analytics range */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Default Analytics Range</h2>
        <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
          The default time window when you open /admin/analytics.
        </p>
        <div className="mt-3 flex gap-2">
          {(['7', '30', '90'] as const).map(r => (
            <button
              key={r}
              onClick={() => setLocalPrefs(p => ({ ...p, defaultRange: r }))}
              className={`rounded-lg border px-4 py-2 text-xs font-medium transition ${
                prefs.defaultRange === r
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-[var(--aw-border-2)] text-[var(--aw-text-2)] hover:text-[var(--aw-text)]'
              }`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </section>

      {/* Sidebar + table prefs */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Layout</h2>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-xs text-[var(--aw-text-2)]">Collapse sidebar by default</span>
            <input
              type="checkbox"
              checked={prefs.sidebarCollapsed ?? false}
              onChange={e => setLocalPrefs(p => ({ ...p, sidebarCollapsed: e.target.checked }))}
              className="h-4 w-4 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-xs text-[var(--aw-text-2)]">Table page size</span>
            <select
              value={prefs.tablePageSize ?? 20}
              onChange={e => setLocalPrefs(p => ({ ...p, tablePageSize: Number(e.target.value) as 10 | 20 | 50 }))}
              className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs text-[var(--aw-text)]"
            >
              <option value={10}>10 rows</option>
              <option value={20}>20 rows</option>
              <option value={50}>50 rows</option>
            </select>
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-40"
        >
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
        <Link href="/admin/settings" className="text-xs text-[var(--aw-cyan)] hover:text-amber-300">
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}
