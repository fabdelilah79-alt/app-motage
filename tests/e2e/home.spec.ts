import { expect, test } from '@playwright/test';

test("la page d'accueil affiche l'aperçu du projet de démonstration", async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'PhysiMotion Studio' })).toBeVisible();

  const title = page.getByText('La chute libre', { exact: true });
  await expect(title).toBeVisible();
  await expect(page.locator('[lang="fr"]').first()).toBeVisible();
});
