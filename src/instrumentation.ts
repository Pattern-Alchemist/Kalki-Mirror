// =============================================================
// KALKI — server error sensor (Vol. 6 #5)
// -------------------------------------------------------------
// The error plane's missing half: sentry.client.config.ts covers the
// browser and withSentryConfig wraps the build, but NOTHING captured
// server-side request errors — captureError had zero callers, so
// production errors died in serverless logs nobody reads.
//
// Next.js instrumentation hooks fix that in one file: register()
// loads the server config, onRequestError hands EVERY uncaught
// server error to Sentry. Honest no-op by design — Sentry.init
// no-ops until the founder flips SENTRY_DSN (one env var, the #12
// posture applied to the error plane).
// =============================================================

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = async (
  ...args: unknown[]
): Promise<void> => {
  const Sentry = await import('@sentry/nextjs');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Sentry as any).captureRequestError?.(...args);
};
