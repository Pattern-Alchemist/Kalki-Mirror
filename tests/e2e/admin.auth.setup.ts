import { test as setup, expect } from '@playwright/test';

const AUTH_FILE = 'tests/e2e/.auth/admin-user.json';

setup('authenticate as admin', async ({ page }) => {
  // This setup file stores authentication state for other tests.
  // Run with: ADMIN_EMAIL=admin@test.com ADMIN_PASSWORD=pass npx playwright test --project=setup
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('Skipping auth setup: ADMIN_EMAIL/ADMIN_PASSWORD not set');
    return;
  }

  await page.goto('/admin/login');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/(overview|$)/, { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
