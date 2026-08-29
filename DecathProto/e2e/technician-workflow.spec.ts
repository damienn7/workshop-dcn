import { expect, test } from '@playwright/test';

import { backendBaseURL, createTechnicianCase } from './support/caseFactory';

test('C43-E2E-001 completes the technician buyback workflow with an accepted decision', async ({ page, request }) => {
  const seededCase = await createTechnicianCase(request);

  await page.goto('/');
  await page.getByPlaceholder(/dossier/i).fill(seededCase.caseNumber);
  await page.getByPlaceholder(/dossier/i).press('Enter');
  await expect(page.getByRole('heading', { name: `Dossier ${seededCase.caseNumber}` })).toBeVisible();

  await page.getByRole('button', { name: 'Démarrer le diagnostic' }).click();
  await expect(page.getByRole('heading', { name: 'Vérification du vélo' })).toBeVisible();

  await page.getByRole('button', { name: 'Excellent' }).click();
  await page.getByRole('button', { name: /Cadre & fourche/ }).click();
  await expect(page.getByRole('heading', { name: 'Cadre & fourche' })).toBeVisible();

  await page.getByRole('button', { name: 'Excellent' }).click();
  await page.getByRole('button', { name: 'Non' }).click();
  await page.getByRole('button', { name: 'Fonctionnelle' }).click();
  await page.getByRole('button', { name: 'Freins' }).click();
  await expect(page.getByRole('heading', { name: 'Freins' })).toBeVisible();

  await page.getByRole('button', { name: 'Correct' }).first().click();
  await page.getByRole('button', { name: 'Correct' }).nth(1).click();
  await page.getByRole('button', { name: 'Bonne épaisseur' }).click();
  await page.getByRole('button', { name: 'Transmission' }).click();
  await expect(page.getByRole('heading', { name: 'Transmission' })).toBeVisible();

  await page.getByRole('button', { name: 'Propre / huilée' }).click();
  await page.getByRole('button', { name: 'Parfait' }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByRole('button', { name: 'Roues' }).click();
  await expect(page.getByRole('heading', { name: 'Roues & pneus' })).toBeVisible();

  await page.getByRole('button', { name: 'Droites' }).click();
  await page.getByRole('button', { name: 'Bonne gomme' }).click();
  await page.getByRole('button', { name: 'Fluides' }).click();
  await page.getByRole('button', { name: 'Finitions' }).click();
  await expect(page.getByRole('heading', { name: 'Finitions' })).toBeVisible();

  await page.getByRole('button', { name: 'Bon état' }).click();
  await page.getByRole('button', { name: 'Stable' }).click();
  await page.getByRole('button', { name: 'Propre' }).click();
  await page.getByRole('button', { name: 'Voir le scoring' }).click();
  await expect(page.getByRole('heading', { name: 'Synthèse diagnostic' })).toBeVisible();

  await page.getByRole('button', { name: 'Générer la décision' }).click();
  await expect(page.getByRole('heading', { name: 'Décision de reprise' })).toBeVisible();
  await expect(page.getByText(/Score technicien/)).toBeVisible();

  await page.getByRole('button', { name: /Valider .*€/ }).click();
  await expect(page.getByRole('heading', { name: 'Reprise acceptée' })).toBeVisible();
  await expect(page.getByText(seededCase.caseNumber)).toBeVisible();

  const persistedResponse = await request.get(`${backendBaseURL}/api/cases/${seededCase.caseNumber}`);
  expect(persistedResponse.ok()).toBe(true);
  const persistedCase = await persistedResponse.json();

  expect(persistedCase).toMatchObject({
    caseNumber: seededCase.caseNumber,
    status: 'accepted'
  });
  expect(persistedCase.finalOffer).toBeGreaterThan(0);
  expect(persistedCase.scoring.finalOffer).toBe(persistedCase.finalOffer);
});
