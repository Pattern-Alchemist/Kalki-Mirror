import * as Sentry from '@sentry/nextjs';

/**
 * I4: Sentry error monitoring integration.
 * 
 * Setup steps:
 * 1. bun add @sentry/nextjs
 * 2. Create sentry.client.config.ts and sentry.server.config.ts (below)
 * 3. Set SENTRY_DSN and SENTRY_ORG in Vercel env
 * 4. Wrap Next.js config with withSentryConfig
 * 
 * For now, this file provides a lightweight error logger that falls back
 * to console.error if Sentry is not configured.
 */

export function captureError(error: Error, context?: Record<string, unknown>) {
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error('[ERROR]', error.message, context || '');
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, { level });
  } else {
    const fn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    fn(`[${level.toUpperCase()}]`, message);
  }
}