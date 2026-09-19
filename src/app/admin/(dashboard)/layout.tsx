import { redirect } from "next/navigation";
import { safeGetToken } from "@/lib/get-token-safe";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { MobileSidebarToggle } from "@/components/admin/mobile-sidebar-toggle";
import { GlobalSearch } from "@/components/admin/global-search";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { GlobalShortcutRegistrar } from "@/components/admin/GlobalShortcutRegistrar";
import { NotificationBell } from "@/components/admin/notification-bell";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { TwoFactorGraceBanner } from "@/components/admin/two-factor-grace-banner";
import { TourProvider } from "@/components/admin/onboarding/TourProvider";
import { QuickTourFAB, HelpButton } from "@/components/admin/onboarding/QuickTourFAB";
import { TopbarHUD } from "@/components/admin/TopbarHUD";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await safeGetToken();
  if (!token?.id) {
    redirect("/admin/login");
  }

  const userData = {
    name: (token.name as string) || "Archivist",
    email: (token.email as string) || "",
    role: (token.role as string) || "ADMIN",
  };

  return (
    <AdminSessionProvider user={userData}>
      <TourProvider>
        <GlobalShortcutRegistrar />
        <CommandPalette />
        <div className="aw-shell flex h-screen text-[var(--aw-text)]">
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          <main className="flex-1 overflow-y-auto">
            <MobileSidebarToggle />
            <TopbarHUD />
            <div className="aw-topbar sticky top-0 z-50 flex items-center gap-3 px-4 py-2 pl-14 lg:pl-6" data-tour="aw-topbar">
              <GlobalSearch />
              <div className="ml-auto flex items-center gap-1">
                <HelpButton />
                <ThemeToggle />
                <NotificationBell />
              </div>
            </div>
            <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
              <AdminBreadcrumbs />
              <TwoFactorGraceBanner />
              {children}
            </div>
          </main>
        </div>
        <QuickTourFAB />
      </TourProvider>
    </AdminSessionProvider>
  );
}
