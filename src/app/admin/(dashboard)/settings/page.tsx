"use client";
import { useEffect, useState } from "react";
import { SessionsSection } from "./sessions-section";

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return <div><p className="text-xs text-zinc-600">{label}</p><p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-200">{value}</p></div>;
}

function EnvCheck({ name, note, optional }: { name: string; note?: string; optional?: boolean }) {
  const [isSet, setIsSet] = useState(false);
  useEffect(() => {
    fetch("/api/admin/env-check?name=" + name).then(r => r.json()).then(d => setIsSet(d.set)).catch(() => {});
  }, [name]);
  // Required + unset  → red "Missing" (action needed).
  // Optional + unset  → amber "Optional" (feature gate, not a fault).
  const label = isSet ? "Set" : optional ? "Optional" : "Missing";
  const tone = isSet ? "text-emerald-400" : optional ? "text-amber-400" : "text-red-400";
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-2">
      <div className="min-w-0">
        <code className="text-xs text-zinc-400">{name}</code>
        {note && <p className="mt-0.5 truncate text-[11px] text-zinc-600">{note}</p>}
      </div>
      <span className={`ml-3 shrink-0 text-xs font-medium ${tone}`}>{label}</span>
    </div>
  );
}

// Production-critical vars — every one is set in Vercel; a red row here means
// a surface is degraded. TURSO_AUTH_TOKEN is the auth-DB secret read directly
// by src/lib/auth.ts; without it admin login fails loud (AUTH_DB_UNCONFIGURED).
const REQUIRED_ENVS: Array<{ name: string; note: string }> = [
  { name: "NEXTAUTH_SECRET", note: "session signing key" },
  { name: "NEXTAUTH_URL", note: "canonical origin for auth callbacks" },
  { name: "TURSO_DATABASE_URL", note: "production database (libSQL)" },
  { name: "TURSO_AUTH_TOKEN", note: "database auth — admin login reads it directly" },
  { name: "OPENROUTER_API_KEY", note: "AI surfaces (search, explain, guides)" },
  { name: "RESEND_API_KEY", note: "transactional email + ops digests" },
];

// Feature gates, not faults. Unset is a legitimate steady state.
const OPTIONAL_ENVS: Array<{ name: string; note: string }> = [
  { name: "DATABASE_URL", note: "local dev fallback — never used in production" },
  { name: "CLOUDINARY_CLOUD_NAME", note: "runtime media uploads (local script path)" },
  { name: "ALLOWED_ADMIN_IPS", note: "admin IP allowlist — empty = open" },
  { name: "EMBED_API_KEY", note: "future neural-embed trigger (embed.ts decision record)" },
];

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
          {REQUIRED_ENVS.map(({ name, note }) => <EnvCheck key={name} name={name} note={note} />)}
        </div>
        <p className="pt-2 text-xs uppercase tracking-wider text-zinc-600">Optional — feature gates</p>
        <div className="space-y-2">
          {OPTIONAL_ENVS.map(({ name, note }) => <EnvCheck key={name} name={name} note={note} optional />)}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Seed Admin Account</h2>
        <p className="text-xs text-zinc-500">
          First-time setup or password rotation. Targets PRODUCTION Turso when TURSO_DATABASE_URL is set (env or .env.local),
          otherwise the local SQLite file. Omit the password to have a strong one generated and printed once.
        </p>
        <code className="block rounded-lg bg-zinc-950 p-3 text-xs text-zinc-400">node scripts/seed-admin.cjs [email] [password]</code>
        <p className="text-xs text-zinc-600">
          Elevated roles carry a 7-day 2FA enrollment window (Vol. 2 #12) — after seeding, enroll at
          Two-Factor below before the deadline, or admin_plus surfaces lock until you do.
        </p>
      </section>
    </div>
  );
}
