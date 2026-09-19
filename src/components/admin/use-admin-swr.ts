'use client';

// =============================================================
// VOL. 2 #5 — useAdminSWR
// -------------------------------------------------------------
// A lightweight SWR (stale-while-revalidate) hook for admin lists.
// No external dependency — uses native fetch + setInterval.
//
// Features:
//   · Initial fetch on mount
//   · Revalidate every N seconds (default 30s)
//   · Revalidate on window focus (tab switch)
//   · Revalidate on manual mutate() call
//   · Optimistic updates via setData (with rollback on next revalidate)
//   · Loading + error states
//   · Dedupes concurrent requests for the same key
//
// Usage:
//   const { data, loading, error, mutate, setData } = useAdminSWR({
//     key: 'consultations',
//     fetcher: () => getConsultations('ALL', 1, 200),
//     revalidateOnFocus: true,
//     refreshInterval: 30000,
//   });
// =============================================================

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseAdminSWROptions<T> {
  /** Cache key — used for deduplication. Must be unique per resource. */
  key: string;
  /** Fetcher function — returns the data. */
  fetcher: () => Promise<T>;
  /** Refresh interval in ms. 0 = no interval. Default 30s. */
  refreshInterval?: number;
  /** Revalidate when the window regains focus. Default true. */
  revalidateOnFocus?: boolean;
  /** Revalidate when the network comes back online. Default true. */
  revalidateOnReconnect?: boolean;
  /** Initial data — if provided, the hook mounts with this and skips the initial fetch. */
  initialData?: T;
  /** Dedupe window in ms — requests within this window for the same key are merged. Default 2000. */
  dedupingInterval?: number;
}

export interface UseAdminSWRResult<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
  /** Optimistically update the data without waiting for a revalidation. */
  setData: (updater: T | ((prev: T | undefined) => T)) => void;
}

// Module-level cache for cross-component deduplication
const cache = new Map<string, { data: unknown; ts: number; promise?: Promise<unknown> }>();

export function useAdminSWR<T>(opts: UseAdminSWROptions<T>): UseAdminSWRResult<T> {
  const {
    key,
    fetcher,
    refreshInterval = 30_000,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    initialData,
    dedupingInterval = 2_000,
  } = opts;

  const [data, setDataState] = useState<T | undefined>(initialData ?? (cache.get(key)?.data as T));
  const [loading, setLoading] = useState<boolean>(!initialData && !cache.has(key));
  const [error, setError] = useState<Error | undefined>(undefined);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const doFetch = useCallback(async (): Promise<void> => {
    // Dedupe: if a request for this key is in flight within the window, skip
    const cached = cache.get(key);
    const now = Date.now();
    if (cached?.promise && cached.ts > now - dedupingInterval) {
      return cached.promise as Promise<void>;
    }

    const promise = (async () => {
      setLoading(true);
      setError(undefined);
      try {
        const fresh = await fetcherRef.current();
        cache.set(key, { data: fresh, ts: Date.now() });
        setDataState(fresh);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Fetch failed'));
      } finally {
        setLoading(false);
      }
    })();
    cache.set(key, { data: cached?.data, ts: now, promise });
    return promise;
  }, [key, dedupingInterval]);

  // Initial fetch
  useEffect(() => {
    if (initialData) return; // skip if initial data provided
    doFetch();
  }, [doFetch, initialData]);

  // Periodic refresh
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    const id = setInterval(() => {
      doFetch();
    }, refreshInterval);
    return () => clearInterval(id);
  }, [doFetch, refreshInterval]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;
    const onFocus = () => doFetch();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [doFetch, revalidateOnFocus]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;
    const onOnline = () => doFetch();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [doFetch, revalidateOnReconnect]);

  // mutate — force a revalidation
  const mutate = useCallback(async (): Promise<void> => {
    cache.delete(key); // bust the dedupe window
    return doFetch();
  }, [key, doFetch]);

  // setData — optimistic update
  const setData = useCallback((updater: T | ((prev: T | undefined) => T)) => {
    setDataState(prev => {
      const next = typeof updater === 'function' ? (updater as (p: T | undefined) => T)(prev) : updater;
      cache.set(key, { data: next, ts: Date.now() });
      return next;
    });
  }, [key]);

  return { data, loading, error, mutate, setData };
}

/**
 * Bust the cache for one or more keys. Useful after a mutation
 * that affects multiple SWR instances.
 */
export function bustAdminSWRCache(keys: string | string[]): void {
  const arr = Array.isArray(keys) ? keys : [keys];
  for (const k of arr) cache.delete(k);
}
