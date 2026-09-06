// =============================================================
// KALKI — Broadcast email content builder (Vol. 3 #6)
// -------------------------------------------------------------
// The founder writes PLAIN TEXT; the builder escapes it and
// renders the same dark serif shell the Doors use. There is
// deliberately no HTML passthrough: the compose surface is the
// admin, but the send path must assume nothing about the input.
// Supported markup (line-based, everything else escaped):
//   · blank line  → paragraph break
//   · "- " line   → bullet
//   · "## " line  → section heading (small caps label)
// Every send carries the signed one-click unsubscribe footer
// (RFC 8058 headers attached at the send site) — mandatory once
// sending is automated (doors-email-course.md §6, now for ops too).
// =============================================================

import { unsubscribeUrl, unsubHeaders } from "@/lib/emails/course-unsubscribe";

export interface BroadcastEmail {
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Render the escaped plain-text body into email-safe HTML blocks. */
export function renderBroadcastBody(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        `<p style="font-size:16px;line-height:1.7;margin:0 0 16px;">${esc(para.join(" "))}</p>`
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        `<ul style="margin:0 0 16px;padding-left:20px;">${list
          .map((li) => `<li style="font-size:16px;line-height:1.7;margin:0 0 6px;">${esc(li)}</li>`)
          .join("")}</ul>`
      );
      list = [];
    }
  };

  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      flushPara();
      flushList();
    } else if (t.startsWith("- ")) {
      flushPara();
      list.push(t.slice(2));
    } else if (t.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(
        `<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a89880;margin:24px 0 12px;">${esc(t.slice(3))}</p>`
      );
    } else {
      flushList();
      para.push(t);
    }
  }
  flushPara();
  flushList();
  return blocks.join("\n");
}

/** Plain-text alternative — the same content, no markup. */
export function renderBroadcastText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split("\n")
        .map((l) => l.replace(/^- /, "• ").replace(/^## /, ""))
        .join("\n")
    )
    .join("\n\n")
    .trim();
}

export function buildBroadcast(subject: string, body: string, email: string): BroadcastEmail {
  const bodyHtml = renderBroadcastBody(body);
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#0d0b09;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:560px;margin:0 auto;padding:36px 24px;color:#e8e0d4;">
<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a89880;margin:0 0 24px;">KALKI · A letter from the work</p>
${bodyHtml}
<p style="font-size:14px;line-height:1.6;color:#a89880;margin:24px 0 0;">— Kaustubh</p>
<hr style="border:none;border-top:1px solid #2a241d;margin:32px 0 16px;">
<p style="font-size:12px;line-height:1.6;color:#6b6154;margin:0;">KALKI · astrokalki.com<br><a href="${unsubscribeUrl(email)}" style="color:#6b6154;">Unsubscribe</a> — one click, no questions, no friction.</p>
</div></body></html>`;

  return {
    subject,
    html,
    text: renderBroadcastText(body),
    headers: unsubHeaders(email),
  };
}
