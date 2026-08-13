"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARNING_MS = 5 * 60 * 1000; // warn 5 min before timeout

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

interface SessionContextValue {
  user: AdminUser;
  sessionStart: Date;
  lastActivity: Date;
  showIdleWarning: boolean;
  dismissWarning: () => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useAdminSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useAdminSession must be used within AdminSessionProvider");
  return ctx;
}

const SHORTCUT_ROUTES: Record<string, string> = {
  "1": "/admin/overview",
  "2": "/admin/members",
  "3": "/admin/keys",
  "4": "/admin/content",
  "5": "/admin/folio",
  "6": "/admin/consultations",
  "7": "/admin/audit",
  "8": "/admin/settings",
};

export function AdminSessionProvider({ user, children }: { user: AdminUser; children: ReactNode }) {
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const dismissWarning = useCallback(() => {
    setShowIdleWarning(false);
    setLastActivity(Date.now());
  }, []);

  const logout = useCallback(async () => {
    await signOut({ callbackUrl: "/admin/login" });
  }, []);
  const router = useRouter();

  // Activity listener
  useEffect(() => {
    const reset = () => {
      setLastActivity(Date.now());
      setShowIdleWarning(false);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, reset));
  }, []);

  // Idle timers
  useEffect(() => {
    const schedule = () => {
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

      warningTimerRef.current = setTimeout(() => {
        setShowIdleWarning(true);
      }, IDLE_TIMEOUT_MS - WARNING_MS);

      logoutTimerRef.current = setTimeout(() => {
        logout();
      }, IDLE_TIMEOUT_MS);
    };

    schedule();
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      if (elapsed >= IDLE_TIMEOUT_MS - WARNING_MS) {
        setShowIdleWarning(true);
      }
    }, 30_000);

    return () => {
      clearInterval(interval);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [lastActivity, logout]);

  // Keyboard shortcuts: Cmd/Ctrl+Shift+L logout, number keys for nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "l") {
        e.preventDefault();
        logout();
      }

      if (!e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const route = SHORTCUT_ROUTES[e.key];
        if (route) {
          e.preventDefault();
          router.push(route);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [logout, router]);

  return (
    <SessionContext.Provider
      value={{
        user,
        sessionStart: new Date(),
        lastActivity: new Date(lastActivity),
        showIdleWarning,
        dismissWarning,
        logout,
      }}
    >
      {children}
      <IdleWarningModal />
    </SessionContext.Provider>
  );
}

function IdleWarningModal() {
  const { showIdleWarning, dismissWarning, logout } = useAdminSession();

  if (!showIdleWarning) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-amber-500/30 bg-zinc-900 p-6 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">Session Expiring</h3>
        <p className="mt-2 text-sm text-zinc-400">
          You&apos;ve been idle for a while. Your session will automatically end in 5 minutes for security.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={dismissWarning}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500"
          >
            I&apos;m Still Here
          </button>
          <button
            onClick={logout}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}