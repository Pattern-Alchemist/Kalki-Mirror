import { redirect } from "next/navigation";
import { safeGetToken } from "@/lib/get-token-safe";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { MobileSidebarToggle } from "@/components/admin/mobile-sidebar-toggle";
import { GlobalSearch } from "@/components/admin/global-search";
import { NotificationBell } from "@/components/admin/notification-bell";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { TwoFactorGraceBanner } from "@/components/admin/two-factor-grace-banner";
import { TourProvider, useTour } from "@/components/admin/onboarding/TourProvider";
import { QuickTourFAB } from "@/components/admin/onboarding/QuickTourFAB";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

// Help button that lives in the topbar — opens the help slide-over
function HelpButton() {
  const { setShowHelp } = useTour();
  return (
    <button
      onClick={() => setShowHelp(true)}
      className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--aw-text-2)] hover:text-[var(--aw-cyan)] hover:bg-[rgba(0,240,255,0.06)] transition-all"
      aria-label="Help & Shortcuts"
      title="Help & Shortcuts (press ?)"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    </button>
  );
}

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
        <div className="aw-shell flex h-screen text-[var(--aw-text)]">
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          <main className="flex-1 overflow-y-auto">
            <MobileSidebarToggle />
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
