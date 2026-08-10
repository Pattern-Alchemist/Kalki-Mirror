'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[KALKI] Unhandled error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto border-2 border-red-500/30 rounded-full flex items-center justify-center">
          <span className="text-red-400 text-2xl font-mono">!</span>
        </div>
        <p className="section-label">System Error</p>
        <h1 className="font-display text-2xl text-foreground font-light tracking-wide">
          The geometry fractured.
        </h1>
        <p className="text-text-secondary text-sm editorial-spacing">
          An unexpected error occurred. The archive remains intact —
          this is a transient disruption in the rendering layer.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-text-muted">
            Error ID: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="gold-cta text-sm"
        >
          Reconstruct
        </button>
        <p className="text-text-muted text-xs">
          If this persists, consult the archivist.
        </p>
      </div>
    </div>
  );
}
