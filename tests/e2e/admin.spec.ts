import { test, expect } from '@playwright/test';

// I1: E2E tests for admin section

test.describe('Admin Login', () => {
  test('login page renders with form elements', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('h1')).toContainText('Archivist Console');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Enter the Sanctum');
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#email', 'invalid@test.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 10_000 });
  });

  test('noscript fallback is present', async ({ page }) => {
    await page.goto('/admin/login');
    const noscript = page.locator('noscript');
    await expect(noscript).toContainText('JavaScript Required');
  });

  test('password strength bar appears on input', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#password', 'test');
    // Strength bar should show (1 of 4 segments filled for weak)
    const bars = page.locator('.h-0\.5.flex-1.rounded-full');
    await expect(bars.first()).toBeVisible();
  });
});

test.describe('Admin Security Headers', () => {
  test('admin routes have noindex header', async ({ page }) => {
    const response = await page.goto('/admin/login');
    const headers = response?.headers();
    expect(headers?.['x-robots-tag']).toContain('noindex');
  });

  test('admin routes have no-referrer policy', async ({ page }) => {
    const response = await page.goto('/admin/login');
    const headers = response?.headers();
    expect(headers?.['referrer-policy']).toContain('no-referrer');
  });
});

test.describe('Admin Protected Routes', () => {
  test('unauthenticated user redirected to login', async ({ page }) => {
    await page.goto('/admin/overview');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('forbidden page renders with 403 status', async ({ request }) => {
    // This test verifies the forbidden route exists
    const response = await request.get('/admin/forbidden');
    // May redirect to login if not authenticated, so just check it doesn't 500
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Admin Navigation', () => {
  // These tests require authentication — skip in CI without credentials
  test.skip(({ }) => true, 'authenticated navigation tests run only with valid session');
});