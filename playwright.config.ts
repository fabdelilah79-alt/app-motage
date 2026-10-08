import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5173',
    // Le guide du premier lancement est déjà « vu » (il a son propre test : tour.spec.ts).
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:5173',
          localStorage: [{ name: 'physimotion.tourSeen', value: '1' }],
        },
      ],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Micro simulé (son de test) pour le scénario d'enregistrement de la voix off.
        permissions: ['microphone'],
        launchOptions: {
          args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
        },
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    // Les tests utilisent un dossier de données séparé : arrêter `npm run dev` avant de les lancer.
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PHYSIMOTION_DATA_DIR: '.e2e-data' },
  },
});
