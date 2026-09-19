'use client';

// =============================================================
// VOL. 2 #6 — ExportButton
// -------------------------------------------------------------
// A small dropdown button that lets the founder export the current
// list as CSV or JSON. The data is fetched from a provided fetcher
// (or already in scope) and serialized client-side via the toCsv /
// toJson utilities. The download is triggered via a Blob URL.
//
// Usage:
//   <ExportButton
//     label="Members"
//     fetcher={() => getMembers('ALL', 1, 200)}
//     mapRow={(m) => ({ email: m.email, tier: m.tier, ... })}
//   />
// =============================================================

import { useState, useCallback } from 'react';
import { toCsv, toJson, contentDisposition, exportFilename, type ExportRow } from '@/lib/admin/export-import';

interface ExportButtonProps {
  /** Label for the button, e.g. "Members" — appears in "Export Members" */
  label: string;
  /** Fetcher that returns the raw rows to export. */
  fetcher: () => Promise<unknown[]>;
  /** Map a raw row to an ExportRow (object with primitive values). */
  mapRow: (row: unknown) => ExportRow;
  /** Filename prefix. Defaults to lowercase label. */
  prefix?: string;
  /** Disabled state (e.g. while data is still loading). */
  disabled?: boolean;
}

export function ExportButton({ label, fetcher, mapRow, prefix, disabled }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const doExport = useCallback(async (fmt: 'csv' | 'json') => {
    setBusy(true);
    setErr(null);
    setOpen(false);
    try {
      const raw = await fetcher();
      const rows = raw.map(mapRow);
      const content = fmt === 'csv' ? toCsv(rows) : toJson(rows, { prettyJson: true });
      const blob = new Blob([content], { type: fmt === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportFilename(prefix || label.toLowerCase(), fmt);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Export failed');
    } finally {
      setBusy(false);
    }
  }, [fetcher, mapRow, prefix, label]);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(prev => !prev)}
        disabled={disabled || busy}
        className="flex items-center gap-2 rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs text-[var(--aw-text-2)] transition hover:border-[var(--aw-border-2)] hover:text-[var(--aw-text)] disabled:cursor-not-allowed disabled:opacity-40"
        aria-label={`Export ${label}`}
      >
        {busy ? (
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        )}
        <span>{busy ? 'Exporting…' : `Export ${label}`}</span>
      </button>
      {err && <span className="ml-2 text-xs text-red-400">{err}</span>}
      {open && !busy && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1 w-32 rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-2)] py-1 shadow-xl backdrop-blur-xl">
            <button
              onClick={() => doExport('csv')}
              className="block w-full px-3 py-2 text-left text-xs text-[var(--aw-text-2)] transition hover:bg-[var(--aw-glass-1)] hover:text-[var(--aw-text)]"
            >
              <span className="font-mono text-[var(--aw-cyan)] mr-2">.csv</span>CSV (Excel)
            </button>
            <button
              onClick={() => doExport('json')}
              className="block w-full px-3 py-2 text-left text-xs text-[var(--aw-text-2)] transition hover:bg-[var(--aw-glass-1)] hover:text-[var(--aw-text)]"
            >
              <span className="font-mono text-[var(--aw-cyan)] mr-2">.json</span>JSON (raw)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
