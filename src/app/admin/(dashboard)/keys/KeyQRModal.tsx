'use client';

import { useState, useCallback } from 'react';

// =============================================================
// VOL. 8 #14 — Keys: QR Code Modal
// Generates a QR code for a key's redeem URL
// =============================================================

export function KeyQRModal({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = `https://www.astrokalki.com/redeem?key=${code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=050608&color=00f0ff&qzone=2`;

  const copyUrl = useCallback(() => {
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={onClose}>
      <div className="aw-surface-2 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-[var(--aw-text)] aw-glow-text">Key QR Code</h3>
          <button onClick={onClose} className="text-[var(--aw-text-3)] hover:text-[var(--aw-danger)] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          {/* QR Code */}
          <div className="p-3 rounded-xl border border-[var(--aw-border-2)] bg-[var(--aw-bg)]" style={{ boxShadow: '0 0 30px -8px var(--aw-glow-cyan)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={`QR code for ${code}`} width={240} height={240} className="rounded-lg" />
          </div>

          {/* Key code */}
          <p className="aw-mono text-sm text-[var(--aw-cyan)] tracking-wider">{code}</p>

          {/* URL + copy */}
          <div className="w-full flex items-center gap-2">
            <input readOnly value={url} className="aw-input text-xs flex-1" />
            <button onClick={copyUrl} className="aw-btn aw-btn-ghost text-xs shrink-0">
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>

          {/* Download */}
          <a href={qrUrl} download={`${code}-qr.png`} className="aw-btn aw-btn-primary w-full justify-center text-xs">
            Download QR PNG
          </a>

          <p className="text-[10px] text-[var(--aw-text-3)] text-center">
            Share this QR physically or send the link directly. The key auto-fills on /redeem.
          </p>
        </div>
      </div>
    </div>
  );
}
