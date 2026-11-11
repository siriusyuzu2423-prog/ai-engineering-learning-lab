import { defineConfig, devices } from '@playwright/test';

const live = process.env.AIELAB_URL;
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  timeout: 45000,
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: live ?? 'http://127.0.0.1:4173/',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'Chrome desktop', grepInvert: /@mobile/, use: { viewport: { width: 1440, height: 900 } } },
    { name: 'Chrome mobile viewport', grep: /@mobile/, use: { ...devices['Pixel 7'] } },
  ],
  webServer: live ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: true,
  },
});
