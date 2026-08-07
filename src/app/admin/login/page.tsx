"use client";

import { useState, useRef, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

function getLoginState(): { attempts: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem("kalki-login");
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return { attempts: 0, lockedUntil: 0 };
}

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/overview";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginState, setLoginState] = useState(getLoginState);
  const attemptTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const locked = loginState.lockedUntil > Date.now();
  const remainingMs = Math.max(0, loginState.lockedUntil - Date.now());
  const remainingSec = Math.ceil(remainingMs / 1000);

  // Clear lockout timer
  if (!locked && loginState.lockedUntil > 0) {
    setLoginState({ attempts: 0, lockedUntil: 0 });
    try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (locked) {
      setError(`Too many attempts. Try again in ${remainingSec}s.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const newState = { ...loginState, attempts: loginState.attempts + 1 };

        if (newState.attempts >= MAX_ATTEMPTS) {
          newState.lockedUntil = Date.now() + LOCKOUT_MS;
          setError(`Too many failed attempts. Locked for 5 minutes.`);
          if (attemptTimerRef.current) clearTimeout(attemptTimerRef.current);
          attemptTimerRef.current = setTimeout(() => {
            setLoginState({ attempts: 0, lockedUntil: 0 });
            try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
          }, LOCKOUT_MS);
        } else {
          setError(`Invalid credentials. ${MAX_ATTEMPTS - newState.attempts} attempts remaining.`);
        }

        setLoginState(newState);
        try { sessionStorage.setItem("kalki-login", JSON.stringify(newState)); } catch { /* */ }
      } else {
        setLoginState({ attempts: 0, lockedUntil: 0 });
        try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  }, [email, password, locked, remainingSec, loginState, callbackUrl, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <svg className="h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100">Archivist Console</h1>
          <p className="mt-1 text-sm text-zinc-500">Kalki Mirror Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-zinc-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={locked}
              className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
              placeholder="archivist@kalki.mirror"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-zinc-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={locked}
              className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || locked}
            className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locked ? `Locked (${remainingSec}s)` : loading ? "Authenticating…" : "Enter the Sanctum"}
          </button>
        </form>

        <p className="text-center text-xs text-zinc-700">
          Access restricted to authorized archivists only.
        </p>
      </div>
    </div>
  );
}
