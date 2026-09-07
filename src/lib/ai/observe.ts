/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — AI route observability (Vol. 4 #17)
   ---------------------------------------------------------------------------
   Nine /api/ai/* routes were rescued from the phantom-key gate (379ba90),
   but the war-room could not say WHICH route failed or latency-drifted.
   This module closes that gap with the sanctioned mechanism: the Vol. 3 #18
   event-dictionary gate (recordEvent rejects unknown names) — so every
   ai_* name in src/lib/analytics-shared.ts is deliberate, and every AI
   route reports through exactly this seam.

   Contract:
     · withAiRoute(eventName, routePath, request, handler) wraps a route
       handler, measures wall latency, maps the HTTP outcome, fires ONE
       first-party event with { latency_ms, outcome } props, and returns
       the handler's response untouched.
     · Outcomes: ok (2xx) · invalid (400) · limited (429) ·
       unconfigured (503) · error (everything else / thrown).
     · FIRE-AND-FORGET, FAIL-OPEN: recording is `void`-ed and recordEvent
       itself never throws — observability can never break a route or add
       awaited latency.
     · The route path is carried in `path` (the event store's own column),
       so the war-room panel can group by route without re-deriving it.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { NextRequest } from 'next/server';
import { recordEvent } from '@/lib/analytics-db';
import type { EventName } from '@/lib/analytics-shared';

/** The ai_* subset of the dictionary — type-level guard for callers. */
export type AiRouteEvent = Extract<EventName, `ai_${string}`>;

export type AiOutcome = 'ok' | 'invalid' | 'limited' | 'unconfigured' | 'error';

/** HTTP status → outcome bucket (kept pure for unit testing). */
export function outcomeForStatus(status: number): AiOutcome {
  if (status >= 200 && status < 300) return 'ok';
  if (status === 400) return 'invalid';
  if (status === 429) return 'limited';
  if (status === 503) return 'unconfigured';
  return 'error';
}

/**
 * Record one AI route call. Fire-and-forget by contract — never await this
 * on the hot path; recordEvent is itself fail-open.
 */
export function observeAiRoute(
  event: AiRouteEvent,
  routePath: string,
  latencyMs: number,
  outcome: AiOutcome,
): void {
  void recordEvent({
    event,
    path: routePath,
    properties: { latency_ms: Math.max(0, Math.round(latencyMs)), outcome },
  });
}

/**
 * Wrap an AI route handler with latency + outcome observability.
 *
 * Usage inside a route module (keeps `export async function POST` intact —
 * the OpenAPI truth gate matches that exact shape):
 *
 *   async function handle(request: NextRequest) { ... }
 *   export async function POST(request: NextRequest) {
 *     return withAiRoute('ai_explain', '/api/ai/explain', request, handle);
 *   }
 */
export async function withAiRoute(
  event: AiRouteEvent,
  routePath: string,
  request: NextRequest,
  handler: (req: NextRequest) => Promise<Response>,
): Promise<Response> {
  const startedAt = Date.now();
  try {
    const response = await handler(request);
    observeAiRoute(event, routePath, Date.now() - startedAt, outcomeForStatus(response.status));
    return response;
  } catch (err) {
    observeAiRoute(event, routePath, Date.now() - startedAt, 'error');
    throw err;
  }
}
