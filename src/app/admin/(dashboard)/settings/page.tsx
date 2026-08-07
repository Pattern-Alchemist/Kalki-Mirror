import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Archivist console configuration</p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Current Session</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-600">Email</p>
            <p className="mt-0.5 text-sm text-zinc-300">{session?.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Name</p>
            <p className="mt-0.5 text-sm text-zinc-300">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Role</p>
            <p className="mt-0.5 text-sm text-amber-400">{(session?.user as unknown as { role: string })?.role || "—"}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Seed Admin</h2>
        <p className="text-xs text-zinc-500">First-time setup: run the seed script locally to create an admin account.</p>
        <code className="block rounded-lg bg-zinc-900 p-3 text-xs text-zinc-400">
          node scripts/seed-admin.cjs [email] [password]
        </code>
      </section>
    </div>
  );
}