"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generate2FASecret, verify2FA, enable2FA, disable2FA } from "@/lib/admin/two-factor";
import { requireRole } from "@/lib/admin/require-role";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { db } from "@/lib/db";

export async function setup2FA() {
  await requireRole("any_staff");
  const session = await getServerSession(authOptions);
  const userId = (session?.user as unknown as { id: string })?.id;
  if (!userId) throw new Error("Not authenticated");

  const result = await generate2FASecret(userId, session!.user!.email!);
  return { qrDataUrl: result.qrDataUrl, secret: result.secret, backupCodes: result.backupCodes };
}

export async function confirm2FA(code: string) {
  await requireRole("any_staff");
  const session = await getServerSession(authOptions);
  const userId = (session?.user as unknown as { id: string })?.id;
  if (!userId) throw new Error("Not authenticated");

  const result = await verify2FA(userId, code);
  if (!result.valid) throw new Error(result.error || "Invalid code");

  await enable2FA(userId);
  await logAudit({ action: "security.2fa.enable", entity: "User", entityId: userId });
  dispatchWebhooks('security.2fa.enable', { userId });
  return { success: true };
}

export async function remove2FA() {
  await requireRole("any_staff");
  const session = await getServerSession(authOptions);
  const userId = (session?.user as unknown as { id: string })?.id;
  if (!userId) throw new Error("Not authenticated");

  await disable2FA(userId);
  await logAudit({ action: "security.2fa.disable", entity: "User", entityId: userId });
  dispatchWebhooks('security.2fa.disable', { userId });
  return { success: true };
}

export async function get2FAStatus() {
  await requireRole("any_staff");
  const session = await getServerSession(authOptions);
  const userId = (session?.user as unknown as { id: string })?.id;
  if (!userId) throw new Error("Not authenticated");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { twoFactorEnabled: true, twoFactorSecret: true, twoFactorBackupCodes: true },
  });

  return {
    enabled: user?.twoFactorEnabled ?? false,
    hasSecret: !!user?.twoFactorSecret,
    backupCodesRemaining: user?.twoFactorBackupCodes
      ? JSON.parse(user.twoFactorBackupCodes).length
      : 0,
  };
}
