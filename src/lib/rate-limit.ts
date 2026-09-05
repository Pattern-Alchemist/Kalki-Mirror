/* ══════════════════════════════════════════════════════════════
   RATE LIMITER — Single source of truth for all API route rate limiting.
   
   Backend strategy (Tier 2 hardening — first distributed store wins):
   1. Upstash Redis (free tier) when UPSTASH_REDIS_REST_URL +
      UPSTASH_REDIS_REST_TOKEN are set — raw REST pipeline over fetch,
      zero extra dependencies, shared across serverless instances.
   2. Vercel KV (legacy) if KV_REST_API_URL + KV_REST_API_TOKEN set
      and the optional @vercel/kv package resolves.
   3. Development / fallback: in-memory sliding window (per-process, resets on cold start)
   
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
   2. Upstash Redis backend — REST pipeline, zero deps, cross-instance
   ------------------------------------------------------------------ */

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const hasUpstash = !!(upstashUrl && upstashToken);

/**
 * Sliding-window limiter over an Upstash Redis REST pipeline.
 * One round-trip: ZREMRANGEBYSCORE (prune) → ZADD (record) → ZCARD (count)
 * → PTTL (window remaining). Same semantics as the Vercel KV path below.
 */
async function upstashRateLimit(cfg: RateLimitConfig): Promise<RateLimitResult> {
  const prefix = cfg.prefix || 'rl';
  const redisKey = `${prefix}:${cfg.key}`;
  const windowMs = cfg.window * 1000;
  const now = Date.now();
  const windowStart = now - windowMs;

  try {
    const res = await fetch(upstashUrl as string, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        ['zremrangebyscore', redisKey, '0', String(windowStart)],
        ['zadd', redisKey, String(now), `${now}-${Math.random()}`],
        ['zcard', redisKey],
        ['pttl', redisKey],
      ]),
      // A limiter must never hang the request path — degrade to memory.
      signal: AbortSignal.timeout(2_500),
    });
    if (!res.ok) throw new Error(`Upstash REST HTTP ${res.status}`);

    const payload = (await res.json()) as Array<{ result: unknown; error: string | null }>;
    if (!Array.isArray(payload)) throw new Error('Upstash REST malformed response');
    for (const entry of payload) {
      if (entry?.error) throw new Error(`Upstash REST error: ${entry.error}`);
    }

    const count = typeof payload[2]?.result === 'number' ? payload[2].result : 1;
    const ttl = typeof payload[3]?.result === 'number' ? payload[3].result : windowMs;

    if (count > cfg.max) {
      return { limited: true, remaining: 0, reset: now + Math.max(ttl, 0) };
    }
    return {
      limited: false,
      remaining: Math.max(0, cfg.max - count),
      reset: now + Math.max(ttl, 0),
    };
  } catch (error) {
    console.error('[rate-limit] Upstash error, falling back:', error);
    return memoryRateLimit(cfg);
  }
}

/* ------------------------------------------------------------------
   2b. Vercel KV (Redis) backend — legacy, shared across serverless invocations
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
   5. Public API
   ------------------------------------------------------------------ */

/**
 * Check if a request should be rate limited.
 * Backend chain: Upstash Redis → Vercel KV → in-memory.
 * Every `limited: true` is counted (Vol. 2 #14) so throttling is visible
 * BEFORE it costs a lead — the snapshot rides on /api/health and the
 * admin overview card.
 */
const LIMIT429_WINDOW_MS = 60_000;
const LIMIT429_MAX_SAMPLES = 10_000; // bounded — 429 storms can't balloon the heap
const limit429Samples: Array<{ prefix: string; ts: number }> = [];

function count429(cfg: RateLimitConfig): void {
  limit429Samples.push({ prefix: cfg.prefix || 'rl', ts: Date.now() });
  if (limit429Samples.length > LIMIT429_MAX_SAMPLES) {
    limit429Samples.splice(0, limit429Samples.length - LIMIT429_MAX_SAMPLES);
  }
}

export interface RateLimit429Snapshot {
  /** 429s in the last minute across all surfaces */
  lastMinute: number;
  /** per-surface breakdown (last minute), e.g. { ai: 12, init: 3 } */
  byPrefix: Record<string, number>;
  /** samples retained by the bounded ring (observability of the counter itself) */
  samples: number;
  /** honest scope note — per serverless instance, not global */
  scope: 'instance';
}

export function rateLimit429Snapshot(): RateLimit429Snapshot {
  const cutoff = Date.now() - LIMIT429_WINDOW_MS;
  const byPrefix: Record<string, number> = {};
  let lastMinute = 0;
  for (let i = limit429Samples.length - 1; i >= 0; i--) {
    const s = limit429Samples[i];
    if (s.ts < cutoff) break; // ring is append-ordered → safe to stop
    lastMinute += 1;
    byPrefix[s.prefix] = (byPrefix[s.prefix] ?? 0) + 1;
  }
  return { lastMinute, byPrefix, samples: limit429Samples.length, scope: 'instance' };
}

export async function rateLimit(cfg: RateLimitConfig): Promise<RateLimitResult> {
  const result = hasUpstash
    ? await upstashRateLimit(cfg)
    : hasKV
      ? await kvRateLimit(cfg)
      : memoryRateLimit(cfg);
  if (result.limited) count429(cfg);
  return result;
}

/** Observability: which backend is live (surfaced on /api/health). */
export function rateLimitBackend(): 'upstash' | 'vercel-kv' | 'memory' {
  if (hasUpstash) return 'upstash';
  if (hasKV) return 'vercel-kv';
  return 'memory';
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
   6. Pre-configured limiters for common patterns
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

export const yantraRateLimit = createRateLimiter({ max: 20, window: 60, prefix: 'yantra' });

/** Abandoned-intake drafts (Tier-5 #2): fires on wizard step transitions +
 * a client debounce — generous but bounded so it can't be used as a write sink. */
export const draftRateLimit = createRateLimiter({ max: 10, window: 300, prefix: 'draft' });
