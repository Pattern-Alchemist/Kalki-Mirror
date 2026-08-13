/**
 * A4: Server-side rate limiter for admin API routes.
 * In-memory sliding window per IP. Survives within a single serverless invocation
 * but resets on cold start — acceptable for Vercel edge + brute-force defense.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const CLEANUP_INTERVAL = 60 * 1000; // clean every minute

// Periodic cleanup to prevent memory leaks
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS);
      if (entry.timestamps.length === 0) store.delete(key);
    }
  }, CLEANUP_INTERVAL);
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  limit: number;
}

export function rateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = WINDOW_MS
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };

  // Sliding window: remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldest + windowMs,
      limit,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetAt: now + windowMs,
    limit,
  };
}

/**
 * Higher-order wrapper for server actions.
 * Throws if rate limit exceeded.
 */
export function withRateLimit(
  key: string,
  limit?: number
): void {
  const result = rateLimit(key, limit);
  if (!result.allowed) {
    throw new Error(
      `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt - Date.now()) / 1000)}s.`
    );
  }
}
