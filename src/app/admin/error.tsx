'use client';

import { useEffect } from 'react';

/**
 * Admin error boundary — no framer-motion dependency.
 * The root error.tsx uses framer-motion which itself can crash
 * during hydration failures, creating a blank page with no feedback.
 * This lightweight admin error boundary ensures users always see
 * a usable error state.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[KALKI Admin] Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500/30">
          <span className="text-red-400 text-xl">!</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-100">Console Error</h1>
          <p className="text-sm text-zinc-400">
            An unexpected error occurred in the Archivist Console.
          </p>
        </div>
        {error.message && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="font-mono text-xs text-red-300 break-all">{error.message}</p>
          </div>
        )}
        {error.digest && (
          <p className="font-mono text-xs text-zinc-600">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-500"
        >
          Retry
        </button>
        <p className="text-xs text-zinc-700">
          If this persists, contact the system administrator.
        </p>
      </div>
    </div>
  );
}
