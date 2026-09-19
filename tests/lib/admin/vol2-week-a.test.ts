// @vitest-environment jsdom

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// =============================================================
// VOL. 2 WEEK A — Tests for the new admin primitives:
//   · CommandPalette action builder
//   · useAdminShortcuts hook (page-local shortcuts)
//   · useGlobalAdminShortcuts hook (g-prefix navigation)
//   · useRowSelection hook (BulkActionBar)
//   · useAdminSWR hook (SWR real-time)
//   · useIsMobile / useBreakpoint hooks
//   · Bulk action server functions (test the inputs shape)
// =============================================================

// We test the pure-logic parts (not the React tree) to avoid
// needing a full DOM environment. Hooks are tested via renderHook.

// --- isTypingInField -------------------------------------------------------

import { isTypingInField, GLOBAL_SHORTCUTS, CONSULTATION_SHORTCUTS, TESTIMONIAL_SHORTCUTS } from '@/components/admin/keyboard-shortcuts';

describe('isTypingInField', () => {
  it('returns false when no input/textarea is focused', () => {
    // In jsdom, document.activeElement is <body> by default — not an input
    // so isTypingInField() should return false
    expect(isTypingInField()).toBe(false);
  });

  it('returns true when an input is focused', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    expect(isTypingInField()).toBe(true);
    document.body.removeChild(input);
  });
});

// --- shortcut docs ---------------------------------------------------------

describe('shortcut documentation', () => {
  it('GLOBAL_SHORTCUTS includes Cmd+K', () => {
    expect(GLOBAL_SHORTCUTS.some(s => s.keys.includes('K') && s.keys.includes('Cmd'))).toBe(true);
  });
  it('GLOBAL_SHORTCUTS includes ? for help', () => {
    expect(GLOBAL_SHORTCUTS.some(s => s.keys.includes('?'))).toBe(true);
  });
  it('CONSULTATION_SHORTCUTS has acknowledge (a)', () => {
    expect(CONSULTATION_SHORTCUTS.some(s => s.keys.includes('a') && s.label.toLowerCase().includes('acknowledge'))).toBe(true);
  });
  it('TESTIMONIAL_SHORTCUTS has approve (a)', () => {
    expect(TESTIMONIAL_SHORTCUTS.some(s => s.keys.includes('a') && s.label.toLowerCase().includes('approve'))).toBe(true);
  });
  it('all shortcuts have keys + label + group', () => {
    for (const s of [...GLOBAL_SHORTCUTS, ...CONSULTATION_SHORTCUTS, ...TESTIMONIAL_SHORTCUTS]) {
      expect(s.keys.length).toBeGreaterThan(0);
      expect(s.label.length).toBeGreaterThan(0);
      expect(['global', 'page', 'action']).toContain(s.group);
    }
  });
});

// --- useRowSelection (BulkActionBar) --------------------------------------

import { useRowSelection } from '@/components/admin/BulkActionBar';

describe('useRowSelection', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useRowSelection());
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.selectedIds).toEqual([]);
  });
  it('toggle adds then removes', () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.toggle('a'));
    expect(result.current.selectedCount).toBe(1);
    expect(result.current.isSelected('a')).toBe(true);
    act(() => result.current.toggle('a'));
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isSelected('a')).toBe(false);
  });
  it('toggleAll selects all when none selected', () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.toggleAll(['a', 'b', 'c']));
    expect(result.current.selectedCount).toBe(3);
  });
  it('toggleAll clears when all selected', () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => result.current.toggleAll(['a', 'b']));
    expect(result.current.selectedCount).toBe(2);
    act(() => result.current.toggleAll(['a', 'b']));
    expect(result.current.selectedCount).toBe(0);
  });
  it('clear resets the set', () => {
    const { result } = renderHook(() => useRowSelection());
    act(() => { result.current.toggle('a'); result.current.toggle('b'); });
    expect(result.current.selectedCount).toBe(2);
    act(() => result.current.clear());
    expect(result.current.selectedCount).toBe(0);
  });
});

// --- useAdminSWR ----------------------------------------------------------

import { useAdminSWR, bustAdminSWRCache } from '@/components/admin/use-admin-swr';

describe('useAdminSWR', () => {
  beforeEach(() => {
    bustAdminSWRCache('test-swr-key');
  });

  it('returns initialData without fetching', async () => {
    const fetcher = vi.fn().mockResolvedValue({ count: 5 });
    const { result } = renderHook(() => useAdminSWR({
      key: 'test-swr-key',
      fetcher,
      initialData: { count: 1 },
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }));
    // Should have the initial data immediately
    expect(result.current.data).toEqual({ count: 1 });
    expect(result.current.loading).toBe(false);
    // Fetcher should not have been called
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fetches when no initialData', async () => {
    const fetcher = vi.fn().mockResolvedValue({ count: 42 });
    const { result } = renderHook(() => useAdminSWR({
      key: 'test-swr-key',
      fetcher,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }));
    // Wait for the fetch to resolve
    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });
    expect(result.current.data).toEqual({ count: 42 });
    expect(result.current.loading).toBe(false);
  });

  it('setData updates optimistically', async () => {
    const fetcher = vi.fn().mockResolvedValue({ count: 0 });
    const { result } = renderHook(() => useAdminSWR({
      key: 'test-swr-key-set',
      fetcher,
      initialData: { count: 0 },
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }));
    act(() => result.current.setData({ count: 99 }));
    expect(result.current.data).toEqual({ count: 99 });
  });

  it('handles fetch errors', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useAdminSWR({
      key: 'test-swr-key-err',
      fetcher,
      refreshInterval: 0,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }));
    await act(async () => {
      await new Promise(r => setTimeout(r, 10));
    });
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('boom');
  });
});

// --- useIsMobile / useBreakpoint -------------------------------------------

import { useIsMobile, useBreakpoint } from '@/components/admin/use-responsive';

describe('useIsMobile', () => {
  it('returns a boolean', () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe('boolean');
  });
});

describe('useBreakpoint', () => {
  it('returns a valid breakpoint string', () => {
    const { result } = renderHook(() => useBreakpoint());
    expect(['sm', 'md', 'lg', 'xl']).toContain(result.current);
  });
});
