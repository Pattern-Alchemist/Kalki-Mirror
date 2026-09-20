'use client';

// =============================================================
// AUDIT2 #39 — Printable Sādhana Card button
// -------------------------------------------------------------
// Renders a "Print / Save as PDF" button on folio pages. The
// existing @media print CSS already strips nav, footer, video,
// and .fixed-bottom-stack — so window.print() produces a clean
// altar-sheet layout. This component just triggers it.
// =============================================================

export function PrintButton({ label = '🖨️ Print / Save as PDF' }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-lg border border-gold/20 bg-gold/5 px-3 py-1.5 text-xs font-medium text-gold-dim hover:text-gold hover:border-gold/40 transition-colors print:hidden"
      aria-label="Print this page or save as PDF"
    >
      {label}
    </button>
  );
}
