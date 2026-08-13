import { db } from "../db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { headers } from "next/headers";
import crypto from "crypto";

/** Extract client IP and hash it for audit logging */
async function getIpHash(): Promise<string> {
  try {
    const headersList = await headers();
    const ip =
      headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headersList.get('x-real-ip') ||
      'unknown';
    return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
  } catch {
    return 'unavailable';
  }
}

export async function logAudit(params: {
  action: string;
  entity: string;
  entityId?: string;
  actorId?: string;
  before?: unknown;
  after?: unknown;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const userId = params.actorId || (session.user as unknown as { id: string }).id;
  const ipHash = await getIpHash();

  await db.adminAuditLog.create({
    data: {
      actorId: userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before ? JSON.stringify(params.before) : null,
      after: params.after ? JSON.stringify(params.after) : null,
      ipHash,
    },
  });
}