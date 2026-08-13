"use client";

import { useState } from "react";
import { useAdminSession } from "@/components/admin/session-provider";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  actorId: string;
  createdAt: string;
}

export function SecuritySection({ audits }: { audits: AuditEntry[] }) {
  const { user, sessionStart } = useAdminSession();
  const [showToken, setShowToken] = useState(false);
  const [csrfInfo] = useState(() => {
    // Derive CSRF status from cookies
    if (typeof document === "undefined") return "Checking...";
    const cookies = document.cookie.split(";");
    const hasCsrf = cookies.some((c) => c.trim().startsWith("next-auth.csrf-token"));
    return hasCsrf ? "Active" : "Not detected";
  });

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Security Posture</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SecurityCheck
          label="Robots Meta"
          value="noindex, nofollow"
          status="pass"
          detail="Admin routes blocked from search engines"
        />
        <SecurityCheck
          label="X-Robots-Tag"
          value="noindex, nofollow"
          status="pass"
          detail="HTTP header set via middleware"
        />
        <SecurityCheck
          label="Referrer Policy"
          value="no-referrer"
          status="pass"
          detail="Admin URLs never leaked to external sites"
        />
        <SecurityCheck
          label="CSRF Protection"
          value={csrfInfo}
          status={csrfInfo === "Active" ? "pass" : "warn"}
          detail="next-auth double-submit cookie"
        />
      </div>

      {/* Session info — E11 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-600">Active Session</h3>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div>
            <span className="text-zinc-600">Logged in as</span>
            <p className="mt-0.5 text-zinc-300">{user.name} ({user.role})</p>
          </div>
          <div>
            <span className="text-zinc-600">Session started</span>
            <p className="mt-0.5 text-zinc-300">{sessionStart.toLocaleTimeString()}</p>
          </div>
          <div>
            <span className="text-zinc-600">Idle timeout</span>
            <p className="mt-0.5 text-zinc-300">30 minutes auto-logout</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowToken(!showToken)}
            className="rounded border border-zinc-800 px-2.5 py-1 text-[10px] text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
          >
            {showToken ? "Hide" : "Show"} Session Fingerprint
          </button>
        </div>
        {showToken && (
          <pre className="rounded-lg bg-black/40 p-3 text-[10px] text-zinc-500 overflow-x-auto">
{JSON.stringify(
  {
    user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) + "..." : "SSR",
    viewport: typeof window !== "undefined" ? `${window.innerWidth}x${window.innerHeight}` : "SSR",
    timestamp: new Date().toISOString(),
    session_role: user.role,
  },
  null,
  2
)}
          </pre>
        )}
      </div>

      {/* Keyboard shortcuts — E12 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-600">Keyboard Shortcuts</h3>
        <div className="grid gap-2 text-xs">
          <ShortcutRow keys={["Ctrl", "K"]} action="Open command palette" />
          <ShortcutRow keys={["Ctrl", "Shift", "L"]} action="Sign out immediately" />
          <ShortcutRow keys={["1"]} action="Go to Overview" />
          <ShortcutRow keys={["2"]} action="Go to Members" />
          <ShortcutRow keys={["3"]} action="Go to Golden Keys" />
          <ShortcutRow keys={["4"]} action="Go to Content Studio" />
          <ShortcutRow keys={["5"]} action="Go to Folio Corpus" />
          <ShortcutRow keys={["6"]} action="Go to Consultations" />
          <ShortcutRow keys={["7"]} action="Go to Audit Log" />
          <ShortcutRow keys={["8"]} action="Go to Settings" />
        </div>
      </div>

      {/* Recent security events — E13 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-600">Recent Activity (Last 10)</h3>
        {audits.length === 0 ? (
          <p className="text-xs text-zinc-600">No audit events recorded.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {audits.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-xs">
                <span className="shrink-0 text-zinc-600 tabular-nums w-32">
                  {new Date(a.createdAt).toLocaleString()}
                </span>
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 font-mono text-amber-400">
                  {a.action}
                </span>
                <span className="text-zinc-500">{a.entity}</span>
                <span className="ml-auto text-zinc-700 truncate max-w-[120px] font-mono text-[10px]">
                  {a.actorId.slice(0, 8)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SecurityCheck({
  label,
  value,
  status,
  detail,
}: {
  label: string;
  value: string;
  status: "pass" | "warn" | "fail";
  detail: string;
}) {
  const colors = {
    pass: "border-emerald-500/20 text-emerald-400",
    warn: "border-amber-500/20 text-amber-400",
    fail: "border-red-500/20 text-red-400",
  };
  const dotColors = {
    pass: "bg-emerald-400",
    warn: "bg-amber-400",
    fail: "bg-red-400",
  };

  return (
    <div className={`rounded-lg border ${colors[status]} p-3 space-y-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[status]}`} />
      </div>
      <p className="text-sm font-mono font-medium">{value}</p>
      <p className="text-[10px] text-zinc-600">{detail}</p>
    </div>
  );
}

function ShortcutRow({ keys, action }: { keys: string[]; action: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd key={k} className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            {k}
          </kbd>
        ))}
      </div>
      <span className="text-zinc-500">{action}</span>
    </div>
  );
}
