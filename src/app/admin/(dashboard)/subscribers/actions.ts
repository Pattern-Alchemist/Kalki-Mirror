"use server";

import { db } from "@/lib/db";
import { safeGetToken } from "@/lib/get-token-safe";

async function requireAdmin() {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const role = session.role as string;
  if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes(role)) {
    throw new Error("Forbidden");
  }
}

export type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  doorDay: number | null;
  createdAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  country: string | null;
  referrerDomain: string | null;
  landingPath: string | null;
};

export async function getSubscribers(): Promise<SubscriberRow[]> {
  await requireAdmin();
  return db.emailSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 2000,
    select: {
      id: true,
      email: true,
      status: true,
      doorDay: true,
      createdAt: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmContent: true,
      country: true,
      referrerDomain: true,
      landingPath: true,
    },
  });
}
