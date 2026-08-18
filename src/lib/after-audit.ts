import { after } from 'next/server';
import { db } from './db';

/**
 * Non-blocking audit log using Next.js `after()` API.
 * Runs after the response is sent — zero latency impact on the caller.
 *
 * Unlike `logAudit()` in lib/admin/audit.ts (which uses getServerSession
 * and is designed for server actions), this is lightweight and works in
 * Route Handlers where we already have the userId from the JWT token.
 */
export function afterAudit(params: {
  action: string;
  entity: string;
  entityId?: string;
  actorId: string;
  before?: unknown;
  after?: unknown;
}) {
  after(async () => {
    try {
      await db.adminAuditLog.create({
        data: {
          actorId: params.actorId,
          action: params.action,
          entity: params.entity,
          entityId: params.entityId,
          before: params.before ? JSON.stringify(params.before) : null,
          after: params.after ? JSON.stringify(params.after) : null,
          ipHash: 'api', // API routes use token auth, IP logged separately by Vercel
        },
      });
    } catch {
      // Silently fail — audit should never break the request
    }
  });
}
