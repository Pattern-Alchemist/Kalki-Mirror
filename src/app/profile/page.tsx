import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfileClient from "./ProfileClient";

/* =============================================================
   /profile — MEMBER SELF-SERVICE (Vol. 3 #11 + #12)
   The seeker's own surface: birth data (which feeds the transit
   engine and the Brahma-muhūrta pulse), data export, and
   account deletion. Noindexed — an authenticated private page,
   never a search destination.
   ============================================================= */

export const metadata: Metadata = {
  title: "Birth Profile — KALKI",
  description: "Your birth data, data export, and account controls.",
  robots: { index: false, follow: true },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user
    ? (session.user as unknown as { id?: string }).id
    : undefined;
  if (!userId) redirect("/admin/login");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tier: true,
      createdAt: true,
      birthDate: true,
      birthPlace: true,
      latitude: true,
      longitude: true,
      timezone: true,
      natalMoonLng: true,
    },
  });
  if (!user) redirect("/admin/login");

  return (
    <ProfileClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier,
        memberSince: user.createdAt.toISOString(),
        birth: {
          birthDate: user.birthDate ? user.birthDate.toISOString().slice(0, 10) : null,
          birthPlace: user.birthPlace,
          latitude: user.latitude,
          longitude: user.longitude,
          timezone: user.timezone,
          natalMoonLng: user.natalMoonLng,
        },
      }}
    />
  );
}
