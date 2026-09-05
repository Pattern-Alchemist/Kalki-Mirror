import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { twoFactorPolicy, TWO_FA_GRACE_DAYS } from "@/lib/admin/two-factor-policy";

/**
 * Vol. 2 #12 — grace-window banner for elevated, unenrolled admins.
 *
 * Renders in the admin layout while an ADMIN/SUPERADMIN is inside (or past)
 * their 2FA grace window: a warning nag in grace, an error bar past due —
 * the action-level gate (requireRole → TwoFactorRequiredError) does the
 * enforcing, this banner explains it. Fail-silent: any error hides the
 * banner, never breaks the console.
 */
export async function TwoFactorGraceBanner() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as unknown as { role?: string } | undefined)?.role;
    const userId = (session?.user as unknown as { id?: string } | undefined)?.id;
    if (!role || !userId) return null;
    if (role !== "ADMIN" && role !== "SUPERADMIN") return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true, elevatedAt: true },
    });
    if (!user) return null;

    const policy = twoFactorPolicy({
      role,
      twoFactorEnabled: user.twoFactorEnabled,
      elevatedAt: user.elevatedAt,
    });
    if (!policy.enrollmentNeeded) return null;

    const deadlineStr = policy.deadline
      ? policy.deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "immediately";

    if (policy.pastDue) {
      return (
        <div className="mb-6 rounded-sm border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          <span className="font-medium">2FA enrollment required.</span> Your grace window has
          ended — elevated actions are locked until you enroll.{" "}
          <a href="/admin/settings" className="underline underline-offset-4 hover:text-red-100">
            Enroll now →
          </a>
        </div>
      );
    }

    return (
      <div className="mb-6 rounded-sm border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        <span className="font-medium">Two-factor authentication is required for your role.</span>{" "}
        Enroll within {TWO_FA_GRACE_DAYS} days of elevation — deadline {deadlineStr}.{" "}
        <a href="/admin/settings" className="underline underline-offset-4 hover:text-amber-100">
          Enroll now →
        </a>
      </div>
    );
  } catch {
    return null;
  }
}
