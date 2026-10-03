import { expect, test } from '@playwright/test';

test("la page d'accueil affiche le lecteur avec les trois langues", async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'PhysiMotion Studio' })).toBeVisible();
  await expect(page.getByText('Bonjour')).toBeVisible();
  await expect(page.getByText('Hello')).toBeVisible();

  const arabic = page.locator('[lang="ar"]');
  await expect(arabic).toHaveText('مرحبا');
  await expect(arabic).toHaveAttribute('dir', 'rtl');
});
