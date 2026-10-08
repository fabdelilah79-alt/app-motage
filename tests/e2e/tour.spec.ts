import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

// Phase 11 : guide d'utilisation au premier lancement, puis plus jamais (sauf bouton « ? »).
test('le guide apparaît une seule fois et peut être relancé', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-project').click();
  await page.getByTestId('new-project-submit').click();
  await expect(page.getByTestId('tour')).toBeVisible();
  for (let step = 0; step < 6; step += 1) await page.getByTestId('tour-next').click();
  await expect(page.getByTestId('tour')).toHaveCount(0);

  await page.reload();
  await expect(page.getByTestId('project-title')).toBeVisible();
  await expect(page.getByTestId('tour')).toHaveCount(0);
  await page.getByTestId('tour-button').click();
  await expect(page.getByTestId('tour')).toBeVisible();
});
