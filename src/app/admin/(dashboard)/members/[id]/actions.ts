"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";

export async function grantKeys(userId: string, amount: number, reason: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const previousKeys = user.goldKeysRemaining;

  const updated = await db.user.update({
    where: { id: userId },
    data: { goldKeysRemaining: { increment: amount } },
  });

  await logAudit({
    action: "user.keys.grant",
    entity: "User",
    entityId: userId,
    before: { goldKeysRemaining: previousKeys },
    after: { goldKeysRemaining: updated.goldKeysRemaining, amount, reason },
  });

  return { success: true, goldKeysRemaining: updated.goldKeysRemaining };
}
