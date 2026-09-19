"use client";

import { useState, useEffect, useCallback } from "react";

// =============================================================
// VOL. 2 #9 — Email Templates Editor
// -------------------------------------------------------------
// Edits DB-backed overrides for transactional emails. Each template
// key matches a hardcoded email builder in src/lib/emails/*.ts. If an
// override exists, the email sender uses it; otherwise it uses the
// default. Supports {{name}}, {{link}}, {{date}}, {{email}}, {{context}}
// placeholders. The Preview button substitutes sample vars so the
// founder can see what the email will actually look like.
// =============================================================

interface Template {
  key: string;
  label: string;
  description: string;
  overridden: boolean;
  subject: string | null;
  body: string | null;
  notes: string | null;
  updatedAt: string | null;
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/email-templates');
      if (!r.ok) throw new Error('Failed to load templates');
      const d = await r.json();
      setTemplates(d.templates);
      if (d.templates.length > 0 && !selectedKey) setSelectedKey(d.templates[0].key);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, [selectedKey]);

  useEffect(() => { load(); }, [load]);

  // When the selected template changes, hydrate the editor
  useEffect(() => {
    const t = templates.find(t => t.key === selectedKey);
    if (t) {
      setSubject(t.subject ?? '');
      setBody(t.body ?? '');
      setNotes(t.notes ?? '');
      setPreview(null);
    }
  }, [selectedKey, templates]);

  const onSave = useCallback(async () => {
    if (!selectedKey) return;
    setSaving(true);
    setError(""); setNotice("");
    try {
      const r = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: selectedKey, subject, body, notes }),
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || 'Save failed');
      }
      setNotice('Saved — the email sender will use this override going forward.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally { setSaving(false); }
  }, [selectedKey, subject, body, notes, load]);

  const onDelete = useCallback(async () => {
    if (!selectedKey) return;
    if (!confirm(`Revert "${selectedKey}" to the hardcoded default? The override will be deleted.`)) return;
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/email-templates?key=${encodeURIComponent(selectedKey)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error('Delete failed');
      setNotice('Reverted — using the hardcoded default.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally { setSaving(false); }
  }, [selectedKey, load]);

  const onPreview = useCallback(async () => {
    setError(""); setNotice("");
    setPreview(null);
    try {
      const r = await fetch('/api/admin/email-templates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      if (!r.ok) throw new Error('Preview failed');
      const d = await r.json();
      setPreview({ subject: d.subject, body: d.body });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
    }
  }, [subject, body]);

  const selected = templates.find(t => t.key === selectedKey);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Email Templates</h1>
        <p className="mt-1 text-sm text-[var(--aw-text-2)]">
          Override subject lines + body copy without a code deploy. Supports <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">{`{{name}}`}</code>, <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">{`{{link}}`}</code>, <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">{`{{date}}`}</code>, <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">{`{{email}}`}</code>, <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">{`{{context}}`}</code> placeholders.
        </p>
      </div>

      {loading && <p className="text-sm text-[var(--aw-text-2)]">Loading templates…</p>}
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {notice && <p className="text-emerald-400 text-sm">{notice}</p>}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Template list */}
        <div className="space-y-1">
          {templates.map(t => (
            <button
              key={t.key}
              onClick={() => setSelectedKey(t.key)}
              className={`block w-full rounded-lg border px-3 py-2 text-left transition ${
                t.key === selectedKey
                  ? 'border-amber-500/40 bg-amber-500/10'
                  : 'border-[var(--aw-border-2)] hover:border-[var(--aw-border-2)] hover:bg-[var(--aw-glass-1)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--aw-text)]">{t.label}</span>
                {t.overridden ? (
                  <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-medium text-emerald-300">OVERRIDE</span>
                ) : (
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] text-[var(--aw-text-3)]">default</span>
                )}
              </div>
              <p className="mt-0.5 text-[10px] text-[var(--aw-text-3)] line-clamp-1">{t.description}</p>
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="space-y-4">
          {selected && (
            <>
              <div className="aw-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-medium text-[var(--aw-text)]">{selected.label}</h2>
                    <p className="mt-0.5 text-xs text-[var(--aw-text-3)]">{selected.description}</p>
                  </div>
                  {selected.overridden && selected.updatedAt && (
                    <span className="text-[10px] text-[var(--aw-text-3)]">Updated {new Date(selected.updatedAt).toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="aw-card space-y-3">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder={`Subject line — e.g. "Your reading — three minutes to close the loop?"`}
                    className="mt-1 w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Body (markdown)</label>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Body copy in markdown. Use {{name}}, {{link}}, {{date}} placeholders."
                    rows={12}
                    className="mt-1 w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 font-mono text-xs text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="e.g. 'A/B test — shorter subject, more direct CTA'"
                    className="mt-1 w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={onSave}
                    disabled={saving || !subject.trim() || !body.trim()}
                    className="rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving ? 'Saving…' : 'Save override'}
                  </button>
                  <button
                    onClick={onPreview}
                    disabled={!subject.trim() && !body.trim()}
                    className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-4 py-2 text-xs font-medium text-[var(--aw-text-2)] transition hover:text-[var(--aw-text)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Preview with sample data
                  </button>
                  {selected.overridden && (
                    <button
                      onClick={onDelete}
                      disabled={saving}
                      className="ml-auto text-xs text-red-400 transition hover:text-red-300 disabled:opacity-40"
                    >
                      Revert to default
                    </button>
                  )}
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <div className="aw-card">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Preview (with sample data)</h3>
                  <div className="mt-3 rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] p-4">
                    <p className="text-sm font-medium text-[var(--aw-text)]">{preview.subject}</p>
                    <pre className="mt-3 whitespace-pre-wrap text-xs text-[var(--aw-text-2)]">{preview.body}</pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
