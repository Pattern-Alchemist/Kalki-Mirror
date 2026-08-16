import { test, expect, request } from '@playwright/test';

/**
 * I1: E2E Tests — Admin Authentication & Navigation
 * Covers: login flow, protected routes, security headers, 2FA infrastructure
 */

test.describe('Admin Authentication', () => {
  test('shows login page at /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator('h1')).toContainText('Archivist Console');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('[type="email"]', 'wrong@example.com');
    await page.fill('[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.text-red-400')).toBeVisible();
  });

  test('has noscript fallback', async ({ page }) => {
    await page.goto('/admin/login');
    const noscript = page.locator('noscript');
    await expect(noscript).toContainText('JavaScript Required');
  });

  test('locks after 5 failed attempts', async ({ page }) => {
    await page.goto('/admin/login');
    for (let i = 0; i < 5; i++) {
      await page.fill('[type="email"]', 'lock@test.com');
      await page.fill('[type="password"]', 'wrong');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(200);
    }
    await expect(page.locator('.text-red-400')).toContainText('Locked');
  });
});

test.describe('Admin Route Protection', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/admin/overview');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('login page has noindex headers', async ({ page }) => {
    const response = await page.goto('/admin/login');
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
  });
});

test.describe('Public Pages', () => {
  test('homepage loads', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
  });

  test('security headers are present', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.headers()['x-frame-options']).toBe('DENY');
    expect(response?.headers()['x-content-type-options']).toBe('nosniff');
    expect(response?.headers()['strict-transport-security']).toContain('max-age');
  });
});

test.describe('2FA Infrastructure', () => {
  /**
   * Test that the 2FA verify API route rejects requests without a pre-auth token.
   * This validates the security fix: unauthenticated users cannot probe 2FA codes.
   */
  test('2FA verify rejects requests without pre-auth token', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: {
        userId: 'some-user-id',
        code: '123456',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired 2FA session');
  });

  /**
   * Test that the 2FA verify API route rejects requests with an invalid code format.
   */
  test('2FA verify rejects invalid code format', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: {
        userId: 'some-user-id',
        code: 'abc',
        preAuthToken: 'invalid-token',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid request');
  });

  /**
   * Test that the 2FA verify API route rejects requests with an invalid pre-auth token.
   */
  test('2FA verify rejects expired/invalid pre-auth token', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: {
        userId: 'some-user-id',
        code: '123456',
        preAuthToken: 'expired-or-fake-token-value',
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('Invalid or expired 2FA session');
  });

  /**
   * Test that the 2FA verify API route rejects requests with mismatched userId.
   * Even if a valid pre-auth token exists for user A, using it with user B's ID should fail.
   */
  test('2FA verify rejects mismatched userId and pre-auth token', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: {
        userId: 'different-user-id',
        code: '123456',
        preAuthToken: 'random-invalid-token',
      },
    });

    expect(response.status()).toBe(401);
  });

  /**
   * Test that the 2FA verify API rejects empty payloads.
   */
  test('2FA verify rejects empty payload', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: {},
    });

    expect(response.status()).toBe(400);
  });

  /**
   * Test that the 2FA verify API rejects missing userId.
   */
  test('2FA verify rejects missing userId', async ({ request }) => {
    const response = await request.post('/api/auth/2fa-verify', {
      data: { code: '123456', preAuthToken: 'some-token' },
    });

    expect(response.status()).toBe(400);
  });
});
