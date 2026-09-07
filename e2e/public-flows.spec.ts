import { test, expect } from '@playwright/test';
import { signUnsubToken } from '../src/lib/emails/course-unsubscribe';

/**
 * Vol. 3 #16 — the two public flows the roadmap demanded:
 *   1. wizard → submit      (/consultations consultation wizard, server action)
 *   2. subscribe → unsubscribe  (/api/subscribe capture, HMAC-signed link out)
 *
 * Both run against a scrubbed local stack (scripts/run-e2e.sh): no RESEND key
 * (welcome email fails soft), no OPENROUTER key (initiate degrades to the
 * deterministic pattern-synthesis path), fresh local SQLite per run.
 */

test.describe('Public flow: consultation wizard → submit', () => {
  test.setTimeout(90_000);

  test('walks all five steps and lands on the acknowledgment panel', async ({ page }) => {
    await page.goto('/consultations');

    // Step 1 — Pattern Self-Assessment: the wizard is the only surface with
    // a "Continue →" control. (Locators are page-scoped ON PURPOSE: scoping
    // via a has-Continue filter dissolves on step 5, where Continue is gone.)
    const next = page.getByRole('button', { name: 'Continue →' });
    await expect(next).toBeVisible({ timeout: 30_000 });

    // Steps 1–4 → 5. All wizard fields are optional; Continue carries
    // defaults. The aria-live step label ("Step N — Title") is the checkpoint.
    for (let step = 2; step <= 5; step++) {
      await next.click();
      await expect(page.getByText(`Step ${step} — `)).toBeVisible({ timeout: 15_000 });
    }

    // Step 5 — Contact & Scheduling: submit is gated on name + whatsapp.
    const send = page.getByRole('button', { name: 'Send Request' });
    await expect(send).toBeDisabled();
    await page.fill('#wiz-name', 'E2E Seeker');
    await page.fill('#wiz-whatsapp', '9876543210');
    await expect(send).toBeEnabled();
    await send.click();

    // Success panel — the wizard's submitted state (server action succeeded).
    await expect(page.getByText('The Archive acknowledges you.')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('Request Received')).toBeVisible();
  });
});

test.describe('Public flow: subscribe → unsubscribe', () => {
  const email = `e2e-subscribe-${Date.now()}@example.com`;

  test('subscribe capture succeeds', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { email, source: 'e2e-flow' },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(['created', 'exists', 'pending']).toContain(body.status);
  });

  test('rejects a malformed address', async ({ request }) => {
    const response = await request.post('/api/subscribe', {
      data: { email: 'not-an-address', source: 'e2e-flow' },
    });
    expect(response.status()).toBe(400);
  });

  test('signed unsubscribe link closes the door', async ({ request }) => {
    // Mint a REAL token with the same secret the dev server runs on (the
    // runner exports NEXTAUTH_SECRET for both processes) — this is the exact
    // link the email footer carries.
    const token = signUnsubToken(email);
    const response = await request.get(
      `/api/email-course/unsubscribe?e=${encodeURIComponent(email)}&t=${token}`
    );
    expect(response.status()).toBe(200);
    const html = await response.text();
    // The "door closed" page only renders when the DB row actually flipped to
    // unsubscribed (updateMany.count > 0) — reaching it proves the write.
    expect(html).toContain('The door is closed.');
    expect(html).toContain(email);
  });

  test('rejects a tampered token', async ({ request }) => {
    const token = signUnsubToken(`other-${email}`);
    const response = await request.get(
      `/api/email-course/unsubscribe?e=${encodeURIComponent(email)}&t=${token}x`
    );
    expect(response.status()).toBe(403);
  });

  test('RFC 8058 one-click POST unsubscribes too', async ({ request }) => {
    const fresh = `e2e-oneclick-${Date.now()}@example.com`;
    const sub = await request.post('/api/subscribe', { data: { email: fresh, source: 'e2e-flow' } });
    expect(sub.status()).toBe(200);

    const token = signUnsubToken(fresh);
    const post = await request.post('/api/email-course/unsubscribe', {
      form: { e: fresh, t: token },
    });
    expect(post.status()).toBe(200);
    expect(await post.text()).toContain('The door is closed.');
  });
});
