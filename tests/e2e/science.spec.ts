import { expect, test } from '@playwright/test';

// Phase 7 : équation avec palette de symboles, repère avec courbe, schéma et encadré.
test('ajouter une équation, une courbe, un schéma et un encadré', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-project').click();
  await page.getByTestId('new-project-title').fill('Sciences e2e');
  await page.getByTestId('new-project-submit').click();
  await expect(page.getByTestId('project-title')).toHaveValue('Sciences e2e');

  await page.getByTestId('tab-science').click();
  await page.getByTestId('add-math').click();
  const latex = page.getByTestId('math-latex');
  await expect(latex).toHaveValue('E_c = \\frac{1}{2} m v^2');
  await latex.fill('v = ');
  await page.getByRole('button', { name: 'a/b' }).click();
  await expect(latex).toHaveValue('v = \\frac{}{}');
  await page.getByTestId('add-math-step').click();

  await page.getByTestId('add-plot-function').click();
  await expect(page.getByTestId('series-expr')).toHaveValue('a*x^2');
  await page.getByTestId('add-decoration-movingPoint').click();

  await page.getByTestId('add-diagram-cart').click();
  await page.getByTestId('add-callout-remember').click();
  await expect(page.getByTestId('element-box')).toHaveCount(4);
});

// Phase 8 : scène 3D (hélice) et vues de caméra.
test('ajouter une scène 3D et changer de vue', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('new-project').click();
  await page.getByTestId('new-project-title').fill('3D e2e');
  await page.getByTestId('new-project-submit').click();
  await page.getByTestId('tab-three').click();
  await page.getByTestId('add-scene3d-helix').click();
  await expect(page.getByTestId('element-box')).toHaveCount(1);
  await page.getByTestId('view-top').click();
  await page.getByTestId('add-object-label').click();
  await expect(page.locator('canvas').first()).toBeAttached();
});
