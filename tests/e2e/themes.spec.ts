import { expect, test } from '@playwright/test';

// Phase 6 : changer de thème en un clic, puis ajouter une scène d'introduction de marque.
test('choisir un thème et ajouter une scène d’introduction', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-project').click();
  await page.getByTestId('new-project-title').fill('Thèmes e2e');
  await page.getByTestId('new-project-submit').click();
  await expect(page.getByTestId('project-title')).toHaveValue('Thèmes e2e');

  await page.getByTestId('theme-button').click();
  await expect(page.getByTestId('theme-minimal-light')).toHaveAttribute('aria-pressed', 'true');
  await page.getByTestId('theme-chalkboard').click();
  await expect(page.getByTestId('theme-chalkboard')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('theme-minimal-light')).toHaveAttribute('aria-pressed', 'false');

  await page.getByRole('tab', { name: 'Kit de marque' }).click();
  await page.getByTestId('brand-intro').click();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('scene-card')).toHaveCount(2);
});
