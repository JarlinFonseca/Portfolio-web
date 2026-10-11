import { expect, test } from '@playwright/test';

test.describe('idiomas y rutas', () => {
  test('"/" redirige según el idioma del navegador', async ({ browser }) => {
    const en = await browser.newContext({ locale: 'en-US' });
    const page = await en.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await en.close();
  });

  test('cambia ES → EN sin recargar, conserva la sección y recuerda la preferencia', async ({
    page,
    context,
  }) => {
    await page.goto('/es#stack');
    await page.evaluate(() => ((window as unknown as { marker: number }).marker = 1));
    await page.getByRole('link', { name: 'English' }).click();
    await expect(page).toHaveURL(/\/en#stack$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('I build the backend');
    // misma página (navegación del cliente): el marcador sigue vivo
    expect(await page.evaluate(() => (window as unknown as { marker?: number }).marker)).toBe(1);
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'lang')?.value).toBe('en');

    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('idioma inválido y rutas inexistentes muestran el 404', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.getByRole('heading', { name: 'Esta página no existe.' })).toBeVisible();
    await page.goto('/en/no-existe');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
