# n8n Automation Recipes (Roadmap #14)

> The site already emits signed, first-party **outbound webhooks** for every
> revenue event (`src/lib/admin/webhook-dispatch.ts`, admin Settings →
> Webhooks). Point one at a free self-hosted n8n (Hetzner/Ora box or Docker
> on a ₹500 VPS) and these recipes need zero changes to the site.

## Webhook events the site emits today

| Event | Payload highlights |
|---|---|
| `consultation.created` | lead id, name, request, country, utm_* |
| `payment.claimed` | leadId, session slug (wizard "I've paid") |
| `payment.paid` / reconciliation | leadId, UTR, amount, session |
| `membership.requested` | name, email, plan, UTR |
| `membership.granted` | email, tier |

Register the n8n URL in **Admin → Settings → Webhooks**; delivery is
fire-and-forget with a signed body (svix-style), and failures never block
the founder's console.

## Recipe 1 — Google Sheets CRM (the founder's spreadsheet brain)

**Trigger:** webhook (all events) → **Switch** on `event` → **Google Sheets
Append Row** (one sheet per event type or one ledger sheet with an
`event` column).

1. Webhook node: method POST, respond immediately `200`.
2. Function node: flatten `{ event, data, occurredAt }`.
3. Sheets node: append to "KALKI CRM" — columns: date, event, name, email,
   session/plan, utr, country, utm_source.
4. Result: every lead, claim, payment and grant lands in a filterable
   sheet — zero console visits for day-to-day review.

## Recipe 2 — WhatsApp template follow-ups (stale-lead nudges)

**Trigger:** Schedule (daily 10:00 IST) → **HTTP Request** to the admin
API (or read the Sheets ledger from Recipe 1) → filter leads with
`status=NEW` older than 24h → **WhatsApp Cloud API / 360dialog send**.

Message skeleton (keep it human, Kaustubh's voice):

> Namaste {{name}} — Kaustubh here. Your intake reached the archive.
> When you are ready, send one message and we begin. — via astrokalki.com

Guardrails: max ONE nudge per lead, never on HIDDEN/PAID leads, and always
disclose it is automated if the platform requires it.

## Recipe 3 — Stale membership-request reminders

**Trigger:** Schedule (daily 09:00 IST) → filter `membership.requested`
rows still `PENDING` after 48h → email digest via the existing Resend
account (from `doors@astrokalki.com`) to `DIGEST_TO`.

Body: plan, seeker email, UTR, requested-at — one line each — plus the
deep link `https://www.astrokalki.com/admin/memberships` to reconcile.

## Ops notes

- Free self-host sizing: 512 MB RAM is enough for all three recipes.
- Keep the webhook URL secret — it is a write-capability into your CRM
  sheet; rotate by re-registering in admin Settings.
- The site's own daily 08:00 IST ops digest (`/api/cron/daily-digest`)
  already covers the "founder reads email" path; n8n is for **action**
  automation (CRM rows, nudges), not another summary.
