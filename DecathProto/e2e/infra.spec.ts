import { expect, test } from '@playwright/test';

import { backendBaseURL } from './support/caseFactory';

test('starts the deterministic frontend and backend acceptance environment', async ({ page, request }) => {
  const health = await request.get(`${backendBaseURL}/health`);
  expect(health.ok()).toBe(true);
  expect(await health.json()).toEqual({
    status: 'ok',
    service: 'diag-seconde-vie-api'
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Diagnostic reprise' })).toBeVisible();
});
