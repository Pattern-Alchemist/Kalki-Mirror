"use client";

import { useState, useTransition } from "react";
import { useAdminSession } from "@/components/admin/session-provider";
import { setup2FA, confirm2FA, remove2FA, get2FAStatus } from "./two-factor-actions";

export function TwoFactorSection() {
  const { user } = useAdminSession();
  const [enabled, setEnabled] = useState(false);
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [step, setStep] = useState<'idle' | 'scanning' | 'verifying'>('idle');
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [backupCodesShown, setBackupCodesShown] = useState(false);

  const handleEnable = () => {
    startTransition(async () => {
      try {
        const result = await setup2FA();
        setQrDataUrl(result.qrDataUrl);
        setBackupCodes(result.backupCodes);
        setStep('scanning');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to enable 2FA');
      }
    });
  };

  const handleVerify = () => {
    if (code.length !== 6) {
      setError('Enter 6-digit code');
      return;
    }
    startTransition(async () => {
      try {
        await confirm2FA(code);
        setEnabled(true);
        setStep('idle');
        setCode('');
        setBackupCodesShown(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid code. Try again.');
      }
    });
  };

  const handleDisable = () => {
    if (!confirm('Disable 2FA? You will need to set it up again.')) return;
    startTransition(async () => {
      try {
        await remove2FA();
        setEnabled(false);
        setBackupCodesShown(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to disable');
      }
    });
  };

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-5">
      <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Two-Factor Authentication</h2>

      {enabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-medium text-emerald-400">2FA Enabled</p>
              <p className="text-xs text-zinc-500">Your account requires a TOTP code on each login.</p>
            </div>
          </div>

          {backupCodesShown && backupCodes.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <p className="text-xs font-medium text-amber-400 mb-2">Backup Codes (save these now)</p>
              <div className="grid grid-cols-2 gap-1">
                {backupCodes.map((c, i) => (
                  <code key={i} className="rounded bg-zinc-950 px-2 py-1 text-xs font-mono text-zinc-300">
                    {c}
                  </code>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleDisable}
            disabled={pending}
            className="rounded-lg border border-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/5 disabled:opacity-50"
          >
            Disable 2FA
          </button>
        </div>
      ) : step === 'scanning' ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 text-center space-y-4">
            <p className="text-sm text-zinc-300">Scan this QR code with your authenticator app</p>
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="2FA QR Code" className="mx-auto rounded-xl" width={200} height={200} />
            ) : (
              <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900">
                <span className="text-xs text-zinc-600">Loading QR...</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="6-digit code"
              className="w-32 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-center text-sm font-mono text-zinc-100 tracking-widest placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none"
            />
            <button
              onClick={handleVerify}
              disabled={pending || code.length !== 6}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:opacity-50"
            >
              {pending ? 'Verifying...' : 'Verify & Enable'}
            </button>
            <button
              onClick={() => { setStep('idle'); setCode(''); setError(''); }}
              className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Add an extra layer of security to your account. After enabling, you will need to enter a code from your authenticator app (Google Authenticator, Authy, etc.) when logging in.
          </p>
          <button
            onClick={handleEnable}
            disabled={pending}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:opacity-50"
          >
            Enable 2FA
          </button>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </section>
  );
}