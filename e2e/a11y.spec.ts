import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/es', '/en']) {
  test(`axe sin violaciones WCAG 2.2 AA en ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}

test('navegación por teclado: «Saltar al contenido» es lo primero', async ({ page }) => {
  await page.goto('/es');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});

test('un solo h1 por página', async ({ page }) => {
  await page.goto('/es');
  await expect(page.locator('h1')).toHaveCount(1);
});
