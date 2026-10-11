import { defineConfig, devices } from '@playwright/test';

/**
 * Sitio público: contra el build servido como en CloudFront (pnpm preview).
 * Admin: contra el servidor de desarrollo con MSW (en producción el admin no se publica hasta R3).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { trace: 'retain-on-failure', locale: 'es-CO' },
  projects: [
    {
      name: 'public-desktop',
      testIgnore: /admin\//,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4173' },
    },
    {
      name: 'public-mobile',
      testMatch: /public-site\.spec\.ts/,
      use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 }, baseURL: 'http://localhost:4173' },
    },
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:5173' },
    },
  ],
  webServer: [
    {
      command: 'pnpm build && pnpm preview',
      url: 'http://localhost:4173/es',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      command: 'pnpm dev',
      url: 'http://localhost:5173/admin/login',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
