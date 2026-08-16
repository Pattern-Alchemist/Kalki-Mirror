"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

/**
 * A10: Live content preview component.
 * Paste markdown and see it rendered in real-time.
 * Also accessible from content editing modal.
 */
export function ContentPreviewClient() {
  const [markdown, setMarkdown] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="mt-12 space-y-4">
      <button
        onClick={() => setShowEditor(!showEditor)}
        className="text-xs text-amber-500 hover:text-amber-400 transition"
      >
        {showEditor ? 'Hide' : 'Show'} Live Markdown Editor
      </button>

      {showEditor && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-1">
            <label className="block text-xs text-zinc-500">Markdown Input</label>
            <textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              rows={16}
              placeholder="Paste or type markdown here..."
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm font-mono text-zinc-100 placeholder-zinc-700 focus:border-amber-500/50 focus:outline-none resize-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-zinc-500">Rendered Preview</label>
            <div className="h-[400px] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-4 prose prose-invert prose-zinc prose-sm max-w-none">
              {markdown ? (
                <ReactMarkdown>{markdown}</ReactMarkdown>
              ) : (
                <span className="text-zinc-700">Start typing to see preview...</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}