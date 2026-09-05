"use client";
import { useEffect, useState } from "react";
import { SessionsSection } from "./sessions-section";

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-xs text-zinc-600">{label}</p><p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-200">{value}</p></div>;
}

function EnvCheck({ name }: { name: string }) {
  const [isSet, setIsSet] = useState(false);
  useEffect(() => {
    fetch("/api/admin/env-check?name=" + name).then(r => r.json()).then(d => setIsSet(d.set)).catch(() => {});
  }, [name]);
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-2">
      <code className="text-xs text-zinc-400">{name}</code>
      <span className={`text-xs font-medium ${isSet ? "text-emerald-400" : "text-red-400"}`}>{isSet ? "Set" : "Missing"}</span>
    </div>
  );
}

export default function SettingsPage() {
  const [session, setSession] = useState<{ id: string; email: string; name: string; role: string } | null>(null);
  const [dbStats, setDbStats] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/session").then(r => r.ok ? r.json() : null),
      fetch("/api/admin/stats").then(r => r.ok ? r.json() : null),
    ]).then(([s, stats]) => {
      if (s) setSession(s);
      if (stats) setDbStats({ Users: stats.members.total, "Invite Codes": stats.keys.total, Consultations: stats.consultations.pending, Content: stats.content.drafts + stats.content.inReview });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-zinc-500">Loading settings...</div>;

  const isSuperAdmin = session?.role === "SUPERADMIN";

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Settings</h1><p className="mt-1 text-sm text-zinc-500">Archivist console configuration</p></div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Current Session</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-xs text-zinc-600">Email</p><p className="mt-0.5 text-sm text-zinc-300">{session?.email || "-"}</p></div>
          <div><p className="text-xs text-zinc-600">Name</p><p className="mt-0.5 text-sm text-zinc-300">{session?.name || "-"}</p></div>
          <div><p className="text-xs text-zinc-600">Role</p><p className="mt-0.5 text-sm text-amber-400">{session?.role || "-"}</p></div>
        </div>
      </section>

      <SessionsSection />

      {dbStats && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Database Summary</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(dbStats).map(([k, v]) => <StatBlock key={k} label={k} value={v} />)}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Environment Variables</h2>
        <div className="space-y-2">
          {["NEXTAUTH_SECRET", "NEXTAUTH_URL", "DATABASE_URL", "TURSO_DATABASE_URL", "CLOUDINARY_CLOUD_NAME", "ALLOWED_ADMIN_IPS"].map(name => <EnvCheck key={name} name={name} />)}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Seed Admin Account</h2>
        <p className="text-xs text-zinc-500">First-time setup: run locally to create an admin user.</p>
        <code className="block rounded-lg bg-zinc-950 p-3 text-xs text-zinc-400">node scripts/seed-admin.cjs [email] [password]</code>
      </section>
    </div>
  );
}
