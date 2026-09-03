/**
 * NOTIFY EVENTS — The Overnight Feed's high-signal triggers (Admin OS v2, Ch 7.1)
 *
 * Every function here is fire-and-forget BY CONTRACT: it must never throw into
 * the caller's flow. A notification is a side effect — a lead, a login, or a
 * deployment must never fail because a bell could not ring.
 *
 * Trigger list (short and high-signal, per the blueprint):
 *   - consultation.created   — public wizard submit → info broadcast + webhook
 *   - security.login_burst   — ≥5 failed admin sign-ins / 10 min → warning
 *
 * (Consultation status changes, key operations and content publishes were
 *  already broadcast by the admin server actions that cause them — see
 *  consultations/keys/content/members actions.ts.)
 */

import { broadcastNotification } from './notifications';
import { dispatchWebhooks } from './webhook-dispatch';

/** The consultation fields the bell body renders. */
export interface ConsultationCreatedPayload {
  id: string;
  name: string;
  request: string;
  country?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

/** Collapse whitespace and cap length so the bell stays one readable line. */
function excerpt(text: string, max = 120): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** Human chips for the attribution the wizard already captured. */
function attributionChips(c: ConsultationCreatedPayload): string {
  const bits: string[] = [];
  if (c.country) bits.push(c.country);
  const channel = [c.utmSource, c.utmMedium].filter(Boolean).join(' / ');
  if (channel) bits.push(channel);
  if (c.utmCampaign) bits.push(c.utmCampaign);
  return bits.length ? ` · ${bits.join(' · ')}` : '';
}

/**
 * A visitor just submitted the consultation wizard — the single most
 * valuable event the site produces. Rings the bell and fires the
 * `consultation.created` webhook so n8n/automation can react later.
 */
export async function eventConsultationCreated(c: ConsultationCreatedPayload): Promise<void> {
  await broadcastNotification({
    title: 'New consultation request',
    body: `${c.name}${attributionChips(c)} — "${excerpt(c.request)}"`,
    type: 'info',
    href: '/admin/consultations',
  }).catch(() => {});

  await dispatchWebhooks('consultation.created', {
    id: c.id,
    name: c.name,
    requestExcerpt: excerpt(c.request, 200),
    country: c.country ?? null,
    utmSource: c.utmSource ?? null,
    utmMedium: c.utmMedium ?? null,
    utmCampaign: c.utmCampaign ?? null,
    at: new Date().toISOString(),
  }).catch(() => {});
}

/**
 * A Golden Key was redeemed on the public /redeem flow — a member unlocked a
 * higher covenant and (per the redeem route) may now hold new keys to pass on.
 * Blueprint trigger-list event: "golden key redeemed".
 */
export async function eventKeyRedeemed(params: {
  code: string;
  tierGranted: string;
  userName?: string | null;
  userEmail?: string | null;
}): Promise<void> {
  const who = params.userName || params.userEmail || 'A member';
  await broadcastNotification({
    title: 'Golden Key redeemed',
    body: `${who} redeemed ${params.code} → ${params.tierGranted} covenant unlocked.`,
    type: 'success',
    href: '/admin/keys',
  }).catch(() => {});

  await dispatchWebhooks('key.redeemed', {
    code: params.code,
    tierGranted: params.tierGranted,
    userName: params.userName ?? null,
    userEmail: params.userEmail ?? null,
    at: new Date().toISOString(),
  }).catch(() => {});
}

/**
 * A burst of failed admin sign-ins — the credential-stuffing tell the
 * blueprint's trigger list calls out. Fired at most once per window by the
 * detector in auth.ts; here we only ring and dispatch.
 */
export async function eventFailedLoginBurst(params: {
  attempts: number;
  windowMinutes: number;
  lastEmail?: string;
}): Promise<void> {
  const tried = params.lastEmail ? ` (last tried: ${params.lastEmail})` : '';
  await broadcastNotification({
    title: 'Security: failed admin login burst',
    body: `${params.attempts} failed admin sign-ins in ${params.windowMinutes} minutes${tried}. Review the audit log before trusting new sessions.`,
    type: 'warning',
    href: '/admin/audit',
  }).catch(() => {});

  await dispatchWebhooks('security.login_burst', {
    attempts: params.attempts,
    windowMinutes: params.windowMinutes,
    lastEmail: params.lastEmail ?? null,
    at: new Date().toISOString(),
  }).catch(() => {});
}
