import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { AdminSessionProvider } from "@/components/admin/session-provider";
import { MobileSidebarToggle } from "@/components/admin/mobile-sidebar-toggle";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/admin/login");
  }

  const userData = {
    name: session.user?.name || "Archivist",
    email: session.user?.email || "",
    role: (session.user as unknown as { role?: string })?.role || "ADMIN",
  };

  return (
    <AdminSessionProvider user={userData}>
      <div className="flex h-screen bg-zinc-950 text-zinc-100">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-y-auto">
          <MobileSidebarToggle />
          <div className="mx-auto max-w-7xl px-4 py-8 pl-14 lg:px-6 lg:pl-6">
            <AdminBreadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </AdminSessionProvider>
  );
}
