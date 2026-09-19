"use client";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import { generateKeys, revokeKey, bulkRevokeKeys } from "./actions";
import { KeyQRModal } from "./KeyQRModal";
import { BulkActionBar, useRowSelection } from "@/components/admin/BulkActionBar";
import { ExportButton } from "@/components/admin/ExportButton";

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Vol. 6 #11 — batch-mint form state
  const [minting, setMinting] = useState(false);
  const [mintCount, setMintCount] = useState(5);
  const [mintTier, setMintTier] = useState("jal");
  const [mintMaxUses, setMintMaxUses] = useState(1);
  const [mintCampaign, setMintCampaign] = useState("");
  const [mintResult, setMintResult] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  // Vol. 2 #4 — bulk selection
  const sel = useRowSelection();
  const [bulkBusy, setBulkBusy] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/keys?query=${encodeURIComponent(query)}&page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setKeys(d.keys); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [query, page]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const onBulkRevoke = useCallback(async () => {
    if (sel.selectedCount === 0) return;
    if (!confirm(`Revoke ${sel.selectedCount} keys? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      const r = await bulkRevokeKeys(sel.selectedIds);
      setMintResult(`Revoked ${r.affected} keys.`);
      sel.clear();
      await fetchKeys();
    } catch (e) {
      setMintResult(`Bulk revoke failed: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally { setBulkBusy(false); }
  }, [sel, fetchKeys]);

  const handleMint = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (minting || mintCount < 1 || mintCount > 50) return;
    setMinting(true);
    setMintResult(null);
    try {
      const codes = await generateKeys(
        mintCount,
        mintTier,
        mintMaxUses,
        undefined, // expiresAt — not in the form, leave null (no expiry)
        mintCampaign.trim() || undefined,
      );
      setMintResult(`Minted ${codes.length} key${codes.length === 1 ? "" : "s"}${mintCampaign.trim() ? ` (campaign: ${mintCampaign.trim().toLowerCase()})` : ""}`);
      // refresh the list to show the new keys
      fetchKeys();
    } catch (err) {
      setMintResult(`Mint failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setMinting(false);
    }
  }, [minting, mintCount, mintTier, mintMaxUses, mintCampaign, fetchKeys]);

  const handleRevoke = useCallback(async (codeId: string) => {
    if (!confirm("Revoke this key? This cannot be undone.")) return;
    try {
      await revokeKey(codeId);
      fetchKeys();
    } catch {}
  }, [fetchKeys]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Golden Keys</h1>
          <p className="mt-1 text-sm text-[var(--aw-text-2)]">{total} invite codes</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/keys/campaigns"
            className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs font-medium text-[var(--aw-text-2)] transition hover:text-[var(--aw-text)]"
            title="Vol. 2 #12 — Campaign analytics"
          >
            📊 Campaigns
          </a>
          <ExportButton
          label="Keys"
          fetcher={async () => {
            const r = await fetch(`/api/admin/keys?query=${encodeURIComponent(query)}&page=1`);
            if (!r.ok) throw new Error('Export fetch failed');
            const d = await r.json();
            return d.keys as any[];
          }}
          mapRow={(r) => ({
            id: (r as any).id,
            code: (r as any).code,
            tierGranted: (r as any).tierGranted,
            maxUses: (r as any).maxUses,
            uses: (r as any)._count?.usages ?? 0,
            campaign: (r as any).campaign ?? '',
            active: (r as any).active,
            createdAt: (r as any).createdAt,
          })}
        />
        </div>
      </div>

      {/* Vol. 6 #11 — Batch Mint Form */}
      <form onSubmit={handleMint} className="aw-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--aw-text)]">Batch Mint</h2>
          <span className="text-xs text-[var(--aw-text-3)]">Vol. 6 #11 — campaign attribution</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Count</label>
            <input type="number" min={1} max={50} value={mintCount} onChange={e => setMintCount(Number(e.target.value))} className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1.5 text-sm text-[var(--aw-text)] focus:border-amber-500/50 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Tier</label>
            <select value={mintTier} onChange={e => setMintTier(e.target.value)} className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1.5 text-sm text-[var(--aw-text)] focus:border-amber-500/50 focus:outline-none">
              <option value="prithvi">Prithvi</option>
              <option value="jal">Jal</option>
              <option value="agni">Agni</option>
              <option value="akash">Akash</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Max uses</label>
            <input type="number" min={1} max={100} value={mintMaxUses} onChange={e => setMintMaxUses(Number(e.target.value))} className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1.5 text-sm text-[var(--aw-text)] focus:border-amber-500/50 focus:outline-none" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Campaign tag (optional)</label>
            <input type="text" value={mintCampaign} onChange={e => setMintCampaign(e.target.value)} placeholder="guhya-halloween-oct26" className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1.5 text-sm text-[var(--aw-text)] placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={minting || mintCount < 1 || mintCount > 50} className="rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-black hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed">
            {minting ? "Minting..." : `Mint ${mintCount} key${mintCount === 1 ? "" : "s"}`}
          </button>
          {mintResult && <span className="text-xs text-[var(--aw-text-2)]">{mintResult}</span>}
        </div>
      </form>

      <input type="text" placeholder="Search code, creator, or campaign..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)] placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none" />
      {loading && <p className="text-[var(--aw-text-2)] text-sm">Loading...</p>}

      {/* Vol. 2 #4 — BulkActionBar for revoke */}
      <BulkActionBar
        selectedCount={sel.selectedCount}
        onClear={sel.clear}
        actions={[
          { label: 'Revoke selected', onClick: onBulkRevoke, variant: 'danger', loading: bulkBusy },
        ]}
      />

      <div className="overflow-x-auto aw-table">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
            <th scope="col" className="px-2 py-3 w-10">
              <input
                type="checkbox"
                aria-label="Select all keys"
                checked={keys.length > 0 && keys.every(k => sel.isSelected(k.id))}
                ref={el => { if (el) el.indeterminate = sel.selectedCount > 0 && sel.selectedCount < keys.length; }}
                onChange={() => sel.toggleAll(keys.map(k => k.id))}
                className="h-3.5 w-3.5 accent-amber-500 cursor-pointer"
              />
            </th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Code</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Tier</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Uses</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Campaign</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Active</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Created</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]"></th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-800/50">
            {keys.map(k => (
              <tr key={k.id} className={`transition hover:bg-[var(--aw-glass-1)]/30 ${sel.isSelected(k.id) ? 'bg-[var(--aw-glass-1)]/40' : ''}`}>
                <td className="px-2 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select key ${k.code}`}
                    checked={sel.isSelected(k.id)}
                    onChange={() => sel.toggle(k.id)}
                    className="h-3.5 w-3.5 accent-amber-500 cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--aw-cyan)]">{k.code}</td>
                <td className="px-4 py-3 text-[var(--aw-text-2)] text-xs">{k.tierGranted}</td>
                <td className="px-4 py-3 tabular-nums text-[var(--aw-text-2)] text-xs">{k._count.usages}/{k.maxUses}</td>
                <td className="px-4 py-3 text-xs text-[var(--aw-text-2)]">{k.campaign ? <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[var(--aw-cyan)]/80">{k.campaign}</span> : <span className="text-zinc-700">—</span>}</td>
                <td className="px-4 py-3">{k.active ? <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" /> : <span className="inline-flex h-2 w-2 rounded-full bg-zinc-600" />}</td>
                <td className="px-4 py-3 text-xs text-[var(--aw-text-2)]">{new Date(k.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button onClick={() => setQrCode(k.code)} className="text-[var(--aw-cyan)] hover:text-[var(--aw-cyan)] transition" title="Show QR code">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" /></svg>
                  </button>
                  {k.active && <button onClick={() => handleRevoke(k.id)} className="text-xs text-[var(--aw-text-3)] hover:text-red-400 transition">revoke</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-[var(--aw-text-2)] hover:text-[var(--aw-text-2)]"}`}>{p}</button>)}</div>}
      {qrCode && <KeyQRModal code={qrCode} onClose={() => setQrCode(null)} />}
    </div>
  );
}
