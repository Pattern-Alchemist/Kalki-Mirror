"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { requireRole } from "@/lib/admin/require-role";

export async function grantKeys(userId: string, amount: number, reason: string) {
  await requireRole('admin_plus');
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
  dispatchWebhooks('user.keys.grant', { targetUserId: userId, amount, reason, newTotal: updated.goldKeysRemaining });

  revalidatePath('/admin/overview');
  revalidatePath('/admin/members');
  return { success: true, goldKeysRemaining: updated.goldKeysRemaining };
}
