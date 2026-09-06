"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getBroadcastAudience,
  previewBroadcast,
  sendBroadcast,
  type BroadcastPreview,
  type BroadcastSendResult,
} from "./actions";

/* ─── Broadcast (Vol. 3 #6) ─────────────────────────────────────────────
   Compose → preview → confirm. The send action is dry-run by default;
   the confirm step here is what flips `confirmed: true`, and the preview
   must be refreshed after any edit before the confirm button arms. */

export default function BroadcastPage() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<{ count: number; cap: number } | null>(null);
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);
  const [armed, setArmed] = useState(false); // confirm step unlocked by a fresh preview
  const [result, setResult] = useState<BroadcastSendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    getBroadcastAudience()
      .then(setAudience)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load audience"));
  }, []);

  const dirty = preview !== null && (preview.text !== body.trim() || subject.trim().length < 3);

  const doPreview = () => {
    setError(null);
    setResult(null);
    setArmed(false);
    startTransition(async () => {
      try {
        const p = await previewBroadcast(subject, body);
        setPreview(p);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Preview failed");
      }
    });
  };

  const doSend = () => {
    if (!armed) return;
    setError(null);
    startTransition(async () => {
      try {
        const r = await sendBroadcast(subject, body, true);
        setResult(r);
        setArmed(false);
        if (r.remaining > 0) {
          // cap overflow — next run continues from the top of the remaining list
          setPreview(null);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Send failed");
      }
    });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Broadcast</h1>
        <p className="mt-1 text-sm text-zinc-500">
          One letter to the whole Doors list. Plain text — blank lines split
          paragraphs, &quot;- &quot; lines become bullets, &quot;## &quot; lines become section labels.
          Every send carries the signed one-click unsubscribe footer.
        </p>
      </div>

      {/* Audience */}
      {audience && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {[
            { label: "Active recipients", value: audience.count },
            { label: "Per-run cap", value: audience.cap },
            {
              label: "Runs to deliver all",
              value: Math.max(1, Math.ceil(audience.count / audience.cap)),
            },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-zinc-100">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Compose */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="broadcast-subject" className="text-xs uppercase tracking-wider text-zinc-500">
              Subject
            </label>
            <input
              id="broadcast-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              placeholder="What the mirror saw this week"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="broadcast-body" className="text-xs uppercase tracking-wider text-zinc-500">
              Body (plain text)
            </label>
            <textarea
              id="broadcast-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={14}
              maxLength={20_000}
              placeholder={"A short letter.\n\n- one point\n- another point\n\n## A section label\nClosing words."}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
            />
            <p className="mt-1 text-xs text-zinc-600">{body.length} / 20,000</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={doPreview}
              disabled={pending || subject.trim().length < 3 || body.trim().length < 20}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending && !preview ? "Rendering…" : "Preview"}
            </button>
            <button
              onClick={doSend}
              disabled={pending || !armed}
              title={armed ? "Send to the batch" : "Preview first — confirm unlocks after a fresh preview"}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending && armed ? "Sending…" : `Confirm send${preview ? ` to ${Math.min(preview.count, preview.cap)}` : ""}`}
            </button>
            {dirty && (
              <span className="self-center text-xs text-amber-400">
                Edited since preview — preview again to re-arm the send.
              </span>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-400">{error}</div>
          )}

          {result && (
            <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 text-sm text-zinc-300">
              {result.needsConfirm ? (
                <p>
                  Dry run complete — {result.total} active recipient(s) would receive
                  &quot;{result.subject}&quot;. Preview, then confirm to send.
                </p>
              ) : (
                <p>
                  Sent {result.sent}, failed {result.failed}, of {result.total}.
                  {result.remaining > 0
                    ? ` ${result.remaining} remain past the per-run cap — preview + confirm again for the next batch.`
                    : " The whole list is delivered."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wider text-zinc-500">
            Preview {preview ? `· ${preview.count} recipient(s) · first: ${preview.sample[0] ?? "—"}` : ""}
          </p>
          {preview ? (
            <>
              <div className="flex flex-wrap gap-1.5">
                {preview.sample.map((e) => (
                  <span key={e} className="rounded-full border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
                    {e}
                  </span>
                ))}
                {preview.count > preview.sample.length && (
                  <span className="rounded-full border border-zinc-800 px-2 py-0.5 text-xs text-zinc-600">
                    +{preview.count - preview.sample.length} more
                  </span>
                )}
              </div>
              <iframe
                title="Broadcast preview"
                srcDoc={preview.html}
                sandbox=""
                className="h-[560px] w-full rounded-xl border border-zinc-800 bg-[#0d0b09]"
              />
              <p className="text-xs text-zinc-600">
                Rendered for the first recipient of the batch — the unsubscribe footer is
                personalized per send.
              </p>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-600">
              No preview yet. Write, then press Preview — the confirm button arms only
              after a fresh render.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
