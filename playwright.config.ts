import { defineConfig, devices } from '@playwright/test';

/**
 * Vol. 3 #16 — E2E runner config.
 *
 * Projects:
 *   setup           — mints e2e/.auth/admin.json (only when ADMIN_EMAIL/ADMIN_PASSWORD set)
 *   chromium        — all unauthenticated specs (public flows + admin walls)
 *   chromium-authed — admin-authed.spec.ts only, runs with the minted session
 *
 * Local:  `npm run test:e2e` (scripts/run-e2e.sh — scrubbed env, fresh SQLite)
 * CI:     .github/workflows/e2e.yml (builds, starts the prod server, seeds an admin)
 */

const AUTH_FILE = 'e2e/.auth/admin.json';
const useAuth = !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    ...(useAuth ? [{ name: 'setup', testMatch: /auth\.setup\.ts/ }] : []),
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /admin-authed\.spec\.ts/,
      dependencies: useAuth ? ['setup'] : [],
    },
    ...(useAuth
      ? [
          {
            name: 'chromium-authed',
            testMatch: /admin-authed\.spec\.ts/,
            dependencies: ['setup'],
            use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
          },
        ]
      : []),
  ],
  webServer: {
    // CI builds once and serves the production bundle; local runs dev.
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
