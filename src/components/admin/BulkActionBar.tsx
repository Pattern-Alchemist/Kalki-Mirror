'use client';

// =============================================================
// VOL. 2 #4 — BulkActionBar
// -------------------------------------------------------------
// A reusable sticky-top action bar that appears when one or more
// rows in a list page are selected. Renders the count + a set of
// actions (passed as props). Mirrors the Vol. 1 #13 pattern,
// extracted for use across all list pages.
//
// Usage:
//   <BulkActionBar
//     selectedCount={3}
//     actions={[
//       { label: 'Approve', onClick: onBulkApprove, variant: 'primary' },
//       { label: 'Hide', onClick: onBulkHide, variant: 'default' },
//     ]}
//     onClear={() => setSelectedIds([])}
//   />
// =============================================================

import { motion, AnimatePresence } from 'framer-motion';

export interface BulkAction {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'default' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}

export interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, actions, onClear }: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="sticky top-16 z-30 mb-4 flex items-center gap-3 rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-2)] px-4 py-2.5 backdrop-blur-xl shadow-lg shadow-black/40"
        >
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--aw-cyan)] text-xs font-bold text-black">
              {selectedCount}
            </span>
            <span className="text-sm text-[var(--aw-text-2)]">selected</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                disabled={a.disabled || a.loading}
                className={getVariantClass(a.variant)}
              >
                {a.loading ? '…' : a.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Clear */}
          <button
            onClick={onClear}
            className="text-xs text-[var(--aw-text-3)] transition-colors hover:text-[var(--aw-text-2)]"
          >
            Clear selection
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getVariantClass(variant: BulkAction['variant'] = 'default'): string {
  switch (variant) {
    case 'primary':
      return 'rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40';
    case 'danger':
      return 'rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40';
    default:
      return 'rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs font-medium text-[var(--aw-text-2)] transition-colors hover:text-[var(--aw-text)] disabled:cursor-not-allowed disabled:opacity-40';
  }
}

// =============================================================
// useRowSelection — a helper hook for list pages
// -------------------------------------------------------------
// Tracks which row IDs are selected. Provides:
//   · toggle(id)       — add/remove a row
//   · toggleAll(ids)   — select-all / clear-all
//   · clear()          — clear all
//   · isSelected(id)   — check
//   · selectedIds      — string[]
//   · selectedCount    — number
//
// Usage:
//   const sel = useRowSelection();
//   <input type="checkbox" checked={sel.isSelected(row.id)} onChange={() => sel.toggle(row.id)} />
//   <BulkActionBar selectedCount={sel.selectedCount} actions={...} onClear={sel.clear} />
// =============================================================

import { useState, useCallback, useMemo } from 'react';

export function useRowSelection() {
  const [set, setSet] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback((ids: string[]) => {
    setSet(prev => {
      // If all are selected, clear; otherwise select all
      const allSelected = ids.every(id => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  }, []);

  const clear = useCallback(() => setSet(new Set()), []);
  const isSelected = useCallback((id: string) => set.has(id), [set]);

  const selectedIds = useMemo(() => Array.from(set), [set]);
  const selectedCount = set.size;

  return { selectedIds, selectedCount, toggle, toggleAll, clear, isSelected };
}
