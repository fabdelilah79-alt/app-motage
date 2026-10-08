import { expect, test } from '@playwright/test';

// Phase 10 : projet créé depuis un modèle, sous-titres, export d'une scène en brouillon.
test('créer un projet depuis un modèle en arabe et exporter une scène', async ({ page }) => {
  test.setTimeout(5 * 60_000);
  await page.goto('/');
  await page.getByTestId('new-project').click();
  await page.getByTestId('template-definition-formula').click();
  await page.getByTestId('new-project-title').fill('Modèle e2e');
  await page.getByTestId('new-project-language').selectOption('ar');
  await page.getByTestId('new-project-submit').click();
  await expect(page.getByTestId('project-title')).toHaveValue('Modèle e2e');
  await expect(page.getByTestId('scene-card')).toHaveCount(3);

  await page.getByTestId('add-subtitle').click();
  await page.getByLabel('Texte du sous-titre').first().fill('الطاقة الحركية');
  await page.getByTestId('subtitles-burn-in').check();

  await page.getByTestId('export-button').click();
  await page.getByTestId('export-quality').selectOption('draft');
  await page.getByTestId('export-range').selectOption('scene');
  await page.getByTestId('export-srt').check();
  await page.getByTestId('export-start').click();
  await expect(page.getByTestId('export-status')).toHaveAttribute('data-status', 'done', {
    timeout: 4 * 60_000,
  });
  await expect(page.getByTestId('export-download')).toBeVisible();
});
