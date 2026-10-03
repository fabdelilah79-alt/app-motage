import { expect, test } from '@playwright/test';

test("l'accueil affiche le bouton « Nouveau projet »", async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'PhysiMotion Studio' })).toBeVisible();
  await expect(page.getByTestId('new-project')).toBeVisible();
});

test("l'interface en arabe passe entièrement de droite à gauche", async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('ui-language').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByTestId('new-project')).toHaveText('مشروع جديد');
  // Remise en français pour les autres tests (langue mémorisée dans le navigateur).
  await page.getByTestId('ui-language').selectOption('fr');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});
