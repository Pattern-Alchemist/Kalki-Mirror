"use server";

/**
 * Tier-1 ② — Membership path (Akash tiers).
 *
 * The manual rail, again: seekers request/pay via UPI, the archivist
 * reconciles and GRANTS here. A grant with a resolvable console user
 * elevates User.tier (the retrieval + dossier surfaces read it
 * server-authoritatively); a grant without a console user stays a
 * ledger row until the seeker creates an account with that email.
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { broadcastNotification } from "@/lib/admin/notifications";
import { safeGetToken } from "@/lib/get-token-safe";
import { pricingTiers } from "@/lib/data/pricing";

async function requireAdmin() {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const role = session.role as string;
  if (!["ADMIN", "SUPERADMIN"].includes(role)) {
    throw new Error("Forbidden");
  }
}

export type MembershipRow = {
  id: string;
  userId: string | null;
  email: string;
  name: string;
  phone: string;
  plan: string;
  tier: string;
  status: string;
  utrRef: string | null;
  grantedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  userName: string | null;
};

export async function getMemberships() {
  await requireAdmin();

  const [rows, counts] = await Promise.all([
    db.membership.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true } } },
    }),
    db.membership.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return {
    memberships: rows.map((m) => ({
      ...m,
      userName: m.user?.name ?? null,
      user: undefined,
    })) as unknown as MembershipRow[],
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
  };
}

/** Manual ledger entry (walk-in, WhatsApp request, payment confirmed out-of-band). */
export async function createMembership(input: {
  name: string;
  email: string;
  phone?: string;
  plan: string;
  utrRef?: string;
}) {
  await requireAdmin();

  const email = input.email.trim().toLowerCase();
  const plan = pricingTiers.find((t) => t.id === input.plan);
  if (!email.includes("@")) throw new Error("A valid email is required.");
  if (!plan) throw new Error("Unknown plan.");

  const membership = await db.membership.create({
    data: {
      name: input.name.trim().slice(0, 120),
      email,
      phone: (input.phone ?? "").trim().slice(0, 30),
      plan: plan.id,
      tier: plan.id,
      status: "PENDING",
      utrRef: input.utrRef?.trim().slice(0, 60) || null,
    },
  });

  await logAudit({
    action: "membership.create",
    entity: "Membership",
    entityId: membership.id,
    after: { email, plan: plan.id, utrRef: membership.utrRef },
  });

  revalidatePath("/admin/memberships");
  return { success: true, id: membership.id };
}

/** Grant: mark ACTIVE and elevate the console user's tier when resolvable. */
export async function grantMembership(membershipId: string, utrRef?: string) {
  await requireAdmin();

  const membership = await db.membership.findUniqueOrThrow({
    where: { id: membershipId },
  });

  const user = await db.user.findUnique({ where: { email: membership.email } });
  if (!user) {
    return {
      success: false,
      error:
        "No console user with this email yet — share a Golden Key first, then grant.",
    };
  }

  await db.membership.update({
    where: { id: membershipId },
    data: {
      status: "ACTIVE",
      userId: user.id,
      tier: membership.plan,
      grantedAt: new Date(),
      ...(utrRef !== undefined && utrRef.trim() !== "" ? { utrRef: utrRef.trim().slice(0, 60) } : {}),
    },
  });
  await db.user.update({
    where: { id: user.id },
    data: { tier: membership.plan },
  });

  await logAudit({
    action: "membership.grant",
    entity: "Membership",
    entityId: membershipId,
    before: { status: membership.status, tier: membership.tier, userTier: user.tier },
    after: { status: "ACTIVE", tier: membership.plan, userTier: membership.plan, userId: user.id },
  });

  await dispatchWebhooks("membership.granted", {
    membershipId,
    email: membership.email,
    tier: membership.plan,
  });
  await broadcastNotification({
    title: "Membership granted",
    body: `${membership.name || membership.email} → ${membership.plan} (tier elevated)`,
    type: "success",
    href: "/admin/memberships",
  });

  revalidatePath("/admin/memberships");
  revalidatePath("/admin/members");
  return { success: true };
}

/** Cancel the ledger row. Deliberately does NOT auto-revert User.tier —
 * downgrades are a founder decision, recorded here as a pointer. */
export async function cancelMembership(membershipId: string) {
  await requireAdmin();

  const membership = await db.membership.findUniqueOrThrow({
    where: { id: membershipId },
  });

  await db.membership.update({
    where: { id: membershipId },
    data: { status: "CANCELLED" },
  });

  await logAudit({
    action: "membership.cancel",
    entity: "Membership",
    entityId: membershipId,
    before: { status: membership.status },
    after: { status: "CANCELLED", note: "User.tier not auto-reverted — founder decides." },
  });

  revalidatePath("/admin/memberships");
  return { success: true };
}

/** Public request — created PENDING from the pricing page's UPI flow. */
export async function requestMembership(input: {
  name: string;
  email: string;
  phone?: string;
  plan: string;
  utrRef?: string;
}) {
  try {
    const email = (input.email ?? "").trim().toLowerCase();
    const plan = pricingTiers.find((t) => t.id === input.plan);
    if (!email.includes("@") || email.length > 200) {
      return { ok: false as const, error: "A valid email is required." };
    }
    if (!plan) return { ok: false as const, error: "Unknown plan." };

    await db.membership.create({
      data: {
        name: (input.name ?? "").trim().slice(0, 120),
        email,
        phone: (input.phone ?? "").trim().slice(0, 30),
        plan: plan.id,
        tier: plan.id,
        status: "PENDING",
        utrRef: input.utrRef?.trim().slice(0, 60) || null,
      },
    });

    await broadcastNotification({
      title: "Membership requested",
      body: `${(input.name || email).slice(0, 60)} → ${plan.element} — reconcile UTR, then grant in Memberships`,
      type: "info",
      href: "/admin/memberships",
    }).catch(() => {});

    return { ok: true as const };
  } catch {
    return { ok: false as const, error: "Request failed — try again." };
  }
}

/** Public: the UPI config for the pricing-page pay intent (null when unset). */
export async function resolvePublicUpi(): Promise<{ vpa: string; payee: string } | null> {
  try {
    const { resolveUpiConfig } = await import("@/lib/utils/upi");
    return resolveUpiConfig();
  } catch {
    return null;
  }
}
