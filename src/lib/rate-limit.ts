/* ══════════════════════════════════════════════════════════════
   RATE LIMITER — Single source of truth for all API route rate limiting.
   
   Backend strategy:
   - Production (Vercel): Vercel KV (Redis) if KV_REST_API_URL + KV_REST_API_TOKEN set
   - Development / fallback: in-memory sliding window (per-process, resets on cold start)
   
   Usage:
     import { rateLimit } from '@/lib/rate-limit';
     const { limited } = await rateLimit({ key: ip, max: 5, window: 60 });
     if (limited) return NextResponse.json({ error: '...' }, { status: 429 });
   ══════════════════════════════════════════════════════════════ */

/* ------------------------------------------------------------------
   1. Types
   ------------------------------------------------------------------ */

export interface RateLimitConfig {
  /** Unique identifier — typically IP or userId */
  key: string;
  /** Max requests allowed within the window */
  max: number;
  /** Window duration in seconds */
  window: number;
  /** Optional prefix for namespacing in KV */
  prefix?: string;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  reset: number; // Unix ms when the window resets
}

/* ------------------------------------------------------------------
   2. Vercel KV (Redis) backend — shared across serverless invocations
   ------------------------------------------------------------------ */

const kvUrl = process.env.KV_REST_API_URL;
const kvToken = process.env.KV_REST_API_TOKEN;
const hasKV = !!(kvUrl && kvToken);

 
let kvClient: any = null;
let kvInitFailed = false;

async function getKv() {
  if (kvClient) return kvClient;
  if (kvInitFailed || !hasKV) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@vercel/kv');
    kvClient = mod.kv;
    return kvClient;
  } catch {
    kvInitFailed = true;
    return null;
  }
}

async function kvRateLimit(cfg: RateLimitConfig): Promise<RateLimitResult> {
  const kv = await getKv();
  if (!kv) return memoryRateLimit(cfg);

  const prefix = cfg.prefix || 'rl';
  const redisKey = `${prefix}:${cfg.key}`;
  const windowMs = cfg.window * 1000;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const pipeline = kv.pipeline();
    pipeline.zremrangebyscore(redisKey, 0, windowStart);
    pipeline.zadd(redisKey, { score: now, member: `${now}-${Math.random()}` });
    pipeline.zcard(redisKey);
    pipeline.pttl(redisKey);
    const results = await pipeline.exec();

    // results is an array of [error, value] tuples
     
    const res = results as any[];
    const count = res[2]?.[1] ?? 1;
    const ttl = res[3]?.[1] ?? windowMs;

    if (count > cfg.max) {
      return { limited: true, remaining: 0, reset: now + Math.max(ttl, 0) };
    }

    return {
      limited: false,
      remaining: Math.max(0, cfg.max - count),
      reset: now + Math.max(ttl, 0),
    };
  } catch (error) {
    console.error('[rate-limit] KV error, falling back to memory:', error);
    return memoryRateLimit(cfg);
  }
}

/* ------------------------------------------------------------------
   3. In-memory backend — dev fallback, per-process
   ------------------------------------------------------------------ */

const memoryStore = new Map<string, number[]>();

function memoryRateLimit(cfg: RateLimitConfig): RateLimitResult {
  const prefix = cfg.prefix || 'rl';
  const storeKey = `${prefix}:${cfg.key}`;
  const windowMs = cfg.window * 1000;
  const now = Date.now();

  const entries = memoryStore.get(storeKey) || [];
  const recent = entries.filter(t => now - t < windowMs);

  if (recent.length >= cfg.max) {
    const oldest = recent[0];
    const reset = oldest + windowMs;
    return { limited: true, remaining: 0, reset };
  }

  recent.push(now);
  memoryStore.set(storeKey, recent);

  return {
    limited: false,
    remaining: cfg.max - recent.length,
    reset: now + windowMs,
  };
}

/* ------------------------------------------------------------------
   4. Public API
   ------------------------------------------------------------------ */

/**
 * Check if a request should be rate limited.
 * Automatically uses Vercel KV in production, in-memory in dev.
 */
export async function rateLimit(cfg: RateLimitConfig): Promise<RateLimitResult> {
  if (hasKV) return kvRateLimit(cfg);
  return memoryRateLimit(cfg);
}

/**
 * Creates a pre-configured rate limiter with fixed settings.
 *
 * @example
 * const aiLimiter = createRateLimiter({ max: 5, window: 60, prefix: 'ai' });
 * const { limited } = await aiLimiter(ip);
 */
export function createRateLimiter(opts: Omit<RateLimitConfig, 'key'>) {
  return (key: string) => rateLimit({ ...opts, key });
}

/* ------------------------------------------------------------------
   5. Pre-configured limiters for common patterns
   ------------------------------------------------------------------ */

/** AI endpoints: 5 requests per minute */
export const aiRateLimit = createRateLimiter({ max: 5, window: 60, prefix: 'ai' });

/** Initiation / heavy computation: 5 requests per minute */
export const initiateRateLimit = createRateLimiter({ max: 5, window: 60, prefix: 'init' });

/** Transit / lightweight read: 20 requests per minute */
export const transitRateLimit = createRateLimiter({ max: 20, window: 60, prefix: 'transit' });

/** Key operations: 10 requests per minute */
export const keyRateLimit = createRateLimiter({ max: 10, window: 60, prefix: 'key' });

export const subscribeRateLimit = createRateLimiter({ max: 5, window: 300, prefix: 'subscribe' });
