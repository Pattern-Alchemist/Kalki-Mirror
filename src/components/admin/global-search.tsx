"use client";

import { useState, useEffect } from "react";

// =============================================================
// VOL. 2 #1 — GlobalSearch is now a thin trigger that opens the
// CommandPalette (Cmd+K). The palette itself is mounted once in
// the admin layout. This button remains for the visible affordance
// in the topbar; clicking it dispatches the same Cmd+K keystroke
// the palette listens for.
// =============================================================

export function GlobalSearch() {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    if (!pressed) return;
    const t = setTimeout(() => setPressed(false), 200);
    return () => clearTimeout(t);
  }, [pressed]);

  return (
    <button
      onClick={() => {
        setPressed(true);
        // Dispatch a synthetic keydown so the CommandPalette picks it up
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
      }}
      className="flex items-center gap-2 rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs text-[var(--aw-text-3)] transition hover:border-[var(--aw-border-2)] hover:text-[var(--aw-text-2)]"
      aria-label="Open command palette"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <span className="hidden sm:inline">Search or jump…</span>
      <kbd className="ml-auto hidden sm:inline rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-2)] px-1 py-0.5 text-[10px] font-mono text-[var(--aw-text-3)]">⌘K</kbd>
    </button>
  );
}
