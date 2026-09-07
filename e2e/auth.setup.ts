import { test as setup, expect } from '@playwright/test';

/**
 * Vol. 3 #16 — Playwright setup project: authenticate as admin and persist
 * the storage state for the `chromium-authed` project.
 *
 * Runs ONLY when ADMIN_EMAIL + ADMIN_PASSWORD are provided (scripts/run-e2e.sh
 * seeds a matching local admin via scripts/seed-admin.cjs). Without creds the
 * setup exits immediately and the authed project is not registered at all.
 *
 * The login here exercises the REAL production path: POST /api/auth/admin-login
 * → Set-Cookie session — the same journey the founder's browser takes.
 */

const AUTH_FILE = 'e2e/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('[auth.setup] ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping (authed project not registered)');
    return;
  }

  await page.goto('/admin/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin(\/overview)?\/?$/, { timeout: 20_000 });

  // The session cookie must actually be present before persisting state.
  const cookies = await page.context().cookies();
  expect(cookies.some((c) => c.name.includes('session-token'))).toBe(true);

  await page.context().storageState({ path: AUTH_FILE });
});
