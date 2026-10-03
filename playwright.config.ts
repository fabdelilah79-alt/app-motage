import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    // Les tests utilisent un dossier de données séparé : arrêter `npm run dev` avant de les lancer.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PHYSIMOTION_DATA_DIR: '.e2e-data' },
  },
});
