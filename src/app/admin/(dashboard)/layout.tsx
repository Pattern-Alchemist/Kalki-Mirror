import { redirect } from "next/navigation";
import { safeGetToken } from "@/lib/get-token-safe";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { MobileSidebarToggle } from "@/components/admin/mobile-sidebar-toggle";
import { GlobalSearch } from "@/components/admin/global-search";
import { NotificationBell } from "@/components/admin/notification-bell";
import { ThemeToggle } from "@/components/admin/theme-toggle";

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
      <div className="flex h-screen bg-zinc-950 text-zinc-100">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <MobileSidebarToggle />
          <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-zinc-800/50 bg-zinc-950/90 px-4 py-2 backdrop-blur-sm pl-14 lg:pl-6">
            <GlobalSearch />
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <NotificationBell />
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
            <AdminBreadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </AdminSessionProvider>
  );
}
