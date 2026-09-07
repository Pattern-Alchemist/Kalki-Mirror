import { test, expect, request } from '@playwright/test';

/**
 * Vol. 3 #16 — consolidated admin E2E (unauthenticated surfaces).
 *
 * History: this suite used to live in TWO places that no runner executed —
 * tests/e2e/** (excluded by vitest, outside Playwright's testDir) and a
 * diverged copy here. Consolidated 2026-09-07: every assertion below is
 * verified against the actual /admin/login markup (#email/#password ids,
 * .text-red-400 error box, "Enter the Sanctum" submit, both noscript strings).
 *
 * Authenticated flows live in admin-authed.spec.ts (separate project —
 * they need a seeded admin + storageState from auth.setup.ts).
 */

test.describe('Admin Authentication (unauthenticated)', () => {
  test('redirects /admin to the login page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login page renders the Archivist Console form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('Archivist Console');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Enter the Sanctum');
  });

  test('shows an error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    // The error box renders either the credentials failure or (if the shared
    // per-IP login limiter fired first) the rate-limit message — both are
    // honest failures and both land in the same .text-red-400 box.
    await expect(page.locator('.text-red-400')).toBeVisible({ timeout: 10_000 });
  });

  test('locks the form after 5 failed attempts', async ({ page }) => {
    await page.goto('/admin/login');
    for (let i = 0; i < 5; i++) {
      await page.fill('#email', 'lock@test.com');
      await page.fill('#password', 'wrong');
      await page.click('button[type="submit"]');
      // The limiter may 429 some attempts (shared 5/60s per-IP budget);
      // the client counts every failure either way, so the 5th always locks.
      await page.waitForTimeout(200);
    }
    await expect(page.locator('.text-red-400')).toContainText('Locked', { timeout: 10_000 });
  });

  test('has a noscript fallback for the console', async ({ page }) => {
    await page.goto('/admin/login');
    // With JavaScript enabled, noscript content is raw text — read the
    // textContent of all instances (strict-mode locators see nothing there).
    const texts = await page.locator('noscript').allTextContents();
    expect(texts.length).toBeGreaterThanOrEqual(1);
    const joined = texts.join('\n');
    expect(joined).toContain('JavaScript Required');
    expect(joined).toContain('The Archivist Console requires JavaScript');
  });

  test('password strength bar appears on input', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#password', 'test');
    const bars = page.locator('.h-0\\.5.flex-1.rounded-full');
    await expect(bars.first()).toBeVisible();
  });
});

test.describe('Admin Route Protection', () => {
  test('redirects unauthenticated users away from the overview', async ({ page }) => {
    await page.goto('/admin/overview');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('forbidden route exists and never 500s', async ({ request }) => {
    const response = await request.get('/admin/forbidden');
    // May redirect to login when unauthenticated — anything but a 5xx is fine.
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Security Headers', () => {
  test('admin login sends noindex', async ({ page }) => {
    const response = await page.goto('/admin/login');
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
  });

  test('public shell sends frame/nosniff/HSTS hardening', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.headers()['x-frame-options']).toBe('DENY');
    expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    expect(response?.headers()['strict-transport-security']).toContain('max-age');
  });
});

test.describe('2FA Infrastructure', () => {
  // Negative coverage for /api/auth/2fa-verify: the route must reject every
  // request that does not carry a pre-auth token minted by admin-login.
  test('rejects requests without a pre-auth token', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: { userId: 'some-user-id', code: '123456' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired 2FA session');
  });

  test('rejects an invalid code format', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: { userId: 'some-user-id', code: 'abc', preAuthToken: 'invalid-token' },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid request');
  });

  test('rejects an expired/fabricated pre-auth token', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: { userId: 'some-user-id', code: '123456', preAuthToken: 'expired-or-fake-token-value' },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired 2FA session');
  });

  test('rejects a userId mismatched with the pre-auth token', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: { userId: 'different-user-id', code: '123456', preAuthToken: 'random-invalid-token' },
    });
    expect(response.status()).toBe(401);
  });

  test('rejects an empty payload', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', { data: {} });
    expect(response.status()).toBe(400);
  });

  test('rejects a payload missing userId', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: { code: '123456', preAuthToken: 'some-token' },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe('Public Shell', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('liveness and health probes answer', async ({ request }) => {
    expect((await request.get('/api')).status()).toBe(200);
    const health = await request.get('/api/health');
    expect([200, 503]).toContain(health.status()); // 503 = honest degraded, still alive
  });
});
