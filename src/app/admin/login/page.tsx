"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;

function getLoginState(): { attempts: number; lockedUntil: number } {
  try {
    const raw = sessionStorage.getItem("kalki-login");
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return { attempts: 0, lockedUntil: 0 };
}

/** Validate callbackUrl to prevent open redirect */
function isSafeUrl(url: string): boolean {
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin;
  } catch {
    return false;
  }
}

function AdminLoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-8 animate-pulse">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-amber-500/30 bg-amber-500/10" />
          <div className="mx-auto h-6 w-40 rounded bg-zinc-800" />
          <div className="mx-auto mt-2 h-4 w-48 rounded bg-zinc-800/60" />
        </div>
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-zinc-800" />
          <div className="h-10 rounded-lg bg-zinc-800" />
          <div className="h-10 rounded-lg bg-amber-600/40" />
        </div>
      </div>
    </div>
  );
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") || "/admin/overview";
  const callbackUrl = isSafeUrl(rawCallback) ? rawCallback : "/admin/overview";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Initialize login state lazily on client only — avoids hydration mismatch
  const [loginState, setLoginState] = useState({ attempts: 0, lockedUntil: 0 });
  const [hydrated, setHydrated] = useState(false);
  const [liveRemaining, setLiveRemaining] = useState(0);
  const [locked, setLocked] = useState(false);

  const attemptTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A1: 2FA state
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [twoFACode, setTwoFACode] = useState("");
  const [twoFAUserId, setTwoFAUserId] = useState("");
  const [twoFAPreAuthToken, setTwoFAPreAuthToken] = useState("");
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState("");

  // Hydration-safe: read sessionStorage only on mount
  useEffect(() => {
    const state = getLoginState();
    setLoginState(state);
    setHydrated(true);
  }, []);

  // Lockout timer logic — all Date.now() usage in effects only
  useEffect(() => {
    if (!hydrated) return;

    const isLocked = loginState.lockedUntil > Date.now();
    setLocked(isLocked);

    if (isLocked) {
      const tick = () => {
        const remaining = Math.max(0, loginState.lockedUntil - Date.now());
        setLiveRemaining(Math.ceil(remaining / 1000));
        if (remaining <= 0) {
          setLoginState({ attempts: 0, lockedUntil: 0 });
          setLocked(false);
          setLiveRemaining(0);
          try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
        }
      };
      tick();
      const interval = setInterval(tick, 1000);
      return () => clearInterval(interval);
    } else {
      setLiveRemaining(0);
    }
  }, [hydrated, loginState.lockedUntil]);

  const handlePasswordChange = useCallback((val: string) => {
    setPassword(val);
    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setPasswordStrength(Math.min(score, 4));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (locked) {
      setError(`Too many attempts. Try again in ${liveRemaining}s.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Get CSRF token from NextAuth
      const csrfRes = await fetch('/api/auth/csrf');
      if (!csrfRes.ok) {
        setError('Authentication service unavailable.');
        return;
      }
      const { csrfToken } = await csrfRes.json();

      // Step 2: POST to the signin endpoint (not callback directly)
      // NextAuth v4 expects the signin endpoint for JSON responses with redirect:false
      const res = await fetch('/api/auth/signin/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken,
          callbackUrl,
          json: 'true',
        }),
      });

      const data = await res.json().catch(() => null);

      // NextAuth v4 signin endpoint returns:
      // On success: { url: "https://..." } with status 200
      // On error: { error: "CredentialsSignin" } or custom error string
      if (data?.url) {
        // Success — NextAuth set the session cookie via Set-Cookie header
        setLoginState({ attempts: 0, lockedUntil: 0 });
        try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      // Check for custom error signals from authorize()
      const errorMsg = data?.error || '';

      if (errorMsg.startsWith('2FA_REQUIRED:')) {
        const parts = errorMsg.split(':');
        setLoginState({ attempts: 0, lockedUntil: 0 });
        try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
        setTwoFAUserId(parts[1] || '');
        setTwoFAPreAuthToken(parts[2] || '');
        setStep('2fa');
        return;
      }

      if (errorMsg.startsWith('LOCKED:')) {
        setError('Account temporarily locked. Please try again later.');
        return;
      }

      // Credentials failed
      const newState = { ...loginState, attempts: loginState.attempts + 1 };

      if (newState.attempts >= MAX_ATTEMPTS) {
        newState.lockedUntil = Date.now() + LOCKOUT_MS;
        setError('Too many failed attempts. Locked for 5 minutes.');
        if (attemptTimerRef.current) clearTimeout(attemptTimerRef.current);
        attemptTimerRef.current = setTimeout(() => {
          setLoginState({ attempts: 0, lockedUntil: 0 });
          setLocked(false);
          try { sessionStorage.removeItem("kalki-login"); } catch { /* */ }
        }, LOCKOUT_MS);
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - newState.attempts} attempts remaining.`);
      }

      setLoginState(newState);
      setLocked(newState.lockedUntil > Date.now());
      try { sessionStorage.setItem("kalki-login", JSON.stringify(newState)); } catch { /* */ }
    } catch {
      setError("An error occurred during sign in.");
    } finally {
      setLoading(false);
    }
  }, [email, password, locked, liveRemaining, loginState, callbackUrl, router]);

  // Reset 2FA state when going back
  const handleBackToLogin = () => {
    setStep('credentials');
    setTwoFACode('');
    setTwoFAError('');
    setTwoFAUserId('');
    setTwoFAPreAuthToken('');
  };

  // A1: Handle 2FA verification
  const handle2FAVerify = async () => {
    if (twoFACode.length !== 6) {
      setTwoFAError('Enter 6-digit code');
      return;
    }
    setTwoFALoading(true);
    setTwoFAError("");
    try {
      const res = await fetch('/api/auth/2fa-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: twoFAUserId, code: twoFACode, preAuthToken: twoFAPreAuthToken }),
      });
      const data = await res.json();
      if (data.valid) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setTwoFAError(data.error || 'Invalid code');
      }
    } catch {
      setTwoFAError('Verification failed');
    } finally {
      setTwoFALoading(false);
    }
  };

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <noscript>
        <meta httpEquiv="refresh" content="0;url=/admin/login?js=disabled" />
        <div style={{ padding: '2rem', textAlign: 'center', color: '#a1a1aa' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '0.5rem' }}>
            JavaScript Required
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            The Archivist Console requires JavaScript for authentication.
            Please enable JavaScript and reload this page.
          </p>
        </div>
      </noscript>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
            <svg className="h-6 w-6 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-100">Archivist Console</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {step === '2fa' ? 'Two-Factor Authentication' : 'Kalki Mirror Administration'}
          </p>
        </div>

        {step === '2fa' ? (
          /* A1: 2FA verification step */
          <div className="space-y-5">
            {twoFAError && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{twoFAError}</div>
            )}
            <div className="text-center">
              <p className="text-sm text-zinc-400">Enter the 6-digit code from your authenticator app.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={twoFACode}
                onChange={e => { setTwoFACode(e.target.value.replace(/\D/g, '')); setTwoFAError(''); }}
                placeholder="000000"
                className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-center text-xl font-mono text-zinc-100 tracking-[0.3em] placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                autoFocus
              />
              <button
                onClick={handle2FAVerify}
                disabled={twoFALoading || twoFACode.length !== 6}
                className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {twoFALoading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <button
              onClick={handleBackToLogin}
              className="w-full text-center text-xs text-zinc-600 hover:text-zinc-400"
            >
              Back to login
            </button>
          </div>
        ) : (
          /* Standard login form */
          <>
            {hydrated && loginState.attempts > 0 && !locked && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Attempts used</span>
                  <span>{loginState.attempts}/{MAX_ATTEMPTS}</span>
                </div>
                <div className="h-1 w-full rounded-full bg-zinc-900">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      loginState.attempts >= 4 ? "bg-red-500" : loginState.attempts >= 2 ? "bg-amber-500" : "bg-zinc-600"
                    }`}
                    style={{ width: `${(loginState.attempts / MAX_ATTEMPTS) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {hydrated && locked && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-center">
                <p className="text-sm font-medium text-red-400">Account Temporarily Locked</p>
                <p className="mt-1 font-mono text-2xl tabular-nums text-red-300">{liveRemaining}s</p>
                <p className="mt-1 text-xs text-zinc-600">Wait for the timer to expire or close this window to reset.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && !locked && (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-400">Email</label>
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
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-zinc-600 transition hover:text-zinc-400"
                  >{showPassword ? "Hide" : "Show"}</button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={locked}
                    className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50 disabled:opacity-50"
                    placeholder="Enter password"
                  />
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-0.5 flex-1 rounded-full transition-all duration-200 ${
                            i <= passwordStrength ? strengthColors[passwordStrength] : "bg-zinc-800"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-600">{strengthLabels[passwordStrength] || ""}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || locked}
                className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locked ? `Locked (${liveRemaining}s)` : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : "Enter the Sanctum"}
              </button>
            </form>
          </>
        )}

        <p className="text-center text-xs text-zinc-700">Access restricted to authorized archivists only.</p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginSkeleton />}>
      <AdminLoginForm />
    </Suspense>
  );
}
