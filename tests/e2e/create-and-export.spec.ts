import path from 'node:path';
import { expect, test } from '@playwright/test';

const IMAGE = path.resolve('tests/e2e/fixtures/schema.svg');

// Scénario de validation de la phase 2 :
// créer un projet → ajouter 2 scènes → ajouter un texte arabe et une image → exporter.
test('créer un projet, le remplir et exporter un MP4', async ({ page }) => {
  test.setTimeout(6 * 60_000);
  await page.goto('/');

  await page.getByTestId('new-project').click();
  await page.getByTestId('new-project-title').fill('Test e2e');
  await page.getByTestId('new-project-submit').click();
  await expect(page.getByTestId('project-title')).toHaveValue('Test e2e');

  await page.getByTestId('add-scene').click();
  await page.getByTestId('add-scene').click();
  await expect(page.getByTestId('scene-card')).toHaveCount(3);

  await page.getByTestId('add-text-ar').click();
  await expect(page.getByTestId('field-lang')).toHaveValue('ar');
  await expect(page.locator('[lang="ar"]', { hasText: 'اكتب نصك هنا' }).first()).toBeAttached();

  await page.getByTestId('tab-media').click();
  await page.getByTestId('upload-image').setInputFiles(IMAGE);
  await expect(page.getByTestId('element-box')).toHaveCount(2);

  await page.getByTestId('save-status').click();
  await expect(page.getByTestId('save-status')).toHaveText(/Enregistré/);

  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('export-status')).toHaveAttribute('data-status', 'done', {
    timeout: 5 * 60_000,
  });
});
