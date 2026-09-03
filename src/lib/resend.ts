// =============================================================
// KALKI — Resend transport (env-first, zero dependencies)
// -------------------------------------------------------------
// Thin fetch client over the Resend REST API. No SDK, works in
// Route Handlers, Server Actions and Vercel Cron functions.
//
// Posture:
//   · Credentials come from env only (RESEND_API_KEY) — never
//     inline, this file ships public (G-10 lesson).
//   · Soft-fail: a missing key or provider outage NEVER throws
//     into caller business logic — signups and crons degrade,
//     they do not break. Errors land in structured logs.
//   · 10s hard timeout — email must never hang a request.
//   · Optional custom headers pass-through (List-Unsubscribe
//     for RFC 8058 one-click, per doors-email-course.md §6).
// =============================================================

const RESEND_API_URL = "https://api.resend.com/emails";

/** Default sender: the publishing voice per doors-email-course.md §1. */
const DEFAULT_FROM = process.env.EMAIL_FROM ?? "Kaustubh — AstroKalki <doors@astrokalki.com>";

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  /** Extra headers — used for List-Unsubscribe / List-Unsubscribe-Post. */
  headers?: Record<string, string>;
}

export interface SendEmailResult {
  ok: boolean;
  id?: string;
  skipped?: boolean;
  error?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[resend] RESEND_API_KEY not set — email skipped:", input.subject);
    return { ok: false, skipped: true, error: "RESEND_API_KEY not set" };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from ?? DEFAULT_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
        ...(input.headers && Object.keys(input.headers).length > 0
          ? { headers: input.headers }
          : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[resend] send failed", res.status, body.slice(0, 300));
      return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }

    const data = (await res.json()) as { id?: string };
    console.info("[resend] sent", input.subject, "→", input.to, "id:", data.id ?? "?");
    return { ok: true, id: data.id };
  } catch (err) {
    console.error("[resend] send threw", err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
