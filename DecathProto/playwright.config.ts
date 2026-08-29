import { defineConfig, devices } from '@playwright/test';

const backendPort = Number(process.env.E2E_BACKEND_PORT ?? 4100);
const frontendPort = Number(process.env.E2E_FRONTEND_PORT ?? 5174);
const backendBaseURL = process.env.E2E_API_BASE_URL ?? `http://127.0.0.1:${backendPort}`;
const frontendBaseURL = process.env.E2E_FRONTEND_BASE_URL ?? `http://127.0.0.1:${frontendPort}`;
const databaseURL = process.env.E2E_DATABASE_URL ?? 'file:/tmp/workshop-dcn-e2e/e2e.db';

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: false,
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL: frontendBaseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: [
    {
      command: `cd ../backend && DATABASE_URL=${databaseURL} npm run db:e2e:reset && DATABASE_URL=${databaseURL} PORT=${backendPort} npm run dev`,
      url: `${backendBaseURL}/health`,
      reuseExistingServer: false,
      timeout: 120_000
    },
    {
      command: `VITE_API_BASE_URL=${backendBaseURL} npm run dev -- --host 127.0.0.1 --port ${frontendPort}`,
      url: frontendBaseURL,
      reuseExistingServer: false,
      timeout: 120_000
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ]
});
