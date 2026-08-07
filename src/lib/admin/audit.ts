import { db } from "../db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";

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

  await db.adminAuditLog.create({
    data: {
      actorId: userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before ? JSON.stringify(params.before) : null,
      after: params.after ? JSON.stringify(params.after) : null,
    },
  });
}