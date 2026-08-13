import { test, expect } from '@playwright/test';

/**
 * I1: E2E Tests — Admin Authentication & Navigation
 * Covers: login flow, protected routes, security headers
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
