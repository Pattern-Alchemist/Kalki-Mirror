import { test, expect } from '@playwright/test';

/**
 * Vol. 3 #16 — authenticated admin flows.
 *
 * These run in the dedicated `chromium-authed` project (storageState minted by
 * auth.setup.ts). They are registered ONLY when ADMIN_EMAIL + ADMIN_PASSWORD
 * are provided — without creds Playwright never matches this file.
 */

test.describe('Admin Console (authenticated)', () => {
  test('overview renders with a session', async ({ page }) => {
    const response = await page.goto('/admin/overview');
    expect(response?.status()).toBe(200);
    // Session holders stay on the console — no login redirect.
    await expect(page).toHaveURL(/\/admin\/overview/);
  });

  test('/admin root does not bounce to login with a session', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin\/login/);
  });
});
