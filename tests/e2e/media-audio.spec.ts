import path from 'node:path';
import { expect, test } from '@playwright/test';

const CLIP = path.resolve('tests/e2e/fixtures/clip.mp4');
const MUSIC = path.resolve('tests/e2e/fixtures/music.wav');

// Scénario de validation de la phase 4 : voix off enregistrée dans l'application (micro simulé),
// musique atténuée sous la voix, vidéo importée puis découpée, export MP4.
test('voix off enregistrée, musique et vidéo découpée, puis export', async ({ page }) => {
  test.setTimeout(6 * 60_000);
  await page.goto('/');
  await page.getByTestId('new-project').click();
  await page.getByTestId('new-project-title').fill('Test médias');
  await page.getByTestId('new-project-submit').click();
  await expect(page.getByTestId('project-title')).toHaveValue('Test médias');

  // Vidéo importée, puis découpée (début à 1 s).
  await page.getByTestId('tab-media').click();
  await page.getByTestId('upload-media').setInputFiles(CLIP);
  await expect(page.getByTestId('element-box')).toHaveCount(1);
  await page.getByRole('tab', { name: /Contenu/ }).click();
  await page.getByTestId('field-trimStart').fill('1');

  // Musique de fond.
  await page.getByTestId('upload-media').setInputFiles(MUSIC);
  await page.getByTestId('use-as-music').click();

  // Voix off enregistrée au micro (simulé) pendant environ 2 secondes.
  await page.getByTestId('tab-audio').click();
  await page.getByTestId('record-voice').click();
  await page.waitForTimeout(2000);
  await page.getByTestId('record-voice').click();
  await expect(page.getByTestId('voiceover')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('voiceover-wave')).toBeVisible();
  await page.getByTestId('fit-scene-to-voice').click();

  await page.getByTestId('save-status').click();
  await page.getByTestId('export-button').click();
  await expect(page.getByTestId('export-status')).toHaveAttribute('data-status', 'done', {
    timeout: 5 * 60_000,
  });
});
