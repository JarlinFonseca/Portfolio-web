import { expect, test } from '@playwright/test';

test.describe('sitio público', () => {
  test('muestra todas las secciones pre-renderizadas sin scroll horizontal', async ({ page }) => {
    await page.goto('/es');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Construyo el backend');
    for (const name of [
      'Trabajo que corre',
      'Código limpio, pipelines',
      'Herramientas que',
      'De la universidad',
      '¿Construimos algo',
    ]) {
      await expect(page.getByRole('heading', { level: 2, name: new RegExp(name) })).toBeVisible();
    }
    await expect(page.getByText('700+').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test('el HTML llega completo desde el servidor (SEO)', async ({ request }) => {
    const html = await (await request.get('/en')).text();
    expect(html).toContain('<html lang="en"');
    expect(html).toContain('I build the backend');
    expect(html).toMatch(/hrefLang="es"/i);
    expect(html).toContain('application/ld+json');
  });

  test('filtra proyectos y actualiza la grilla', async ({ page }) => {
    await page.goto('/es');
    const filters = page.getByRole('group', { name: 'Filtrar proyectos' });
    await expect(page.getByRole('article')).toHaveCount(11);
    await filters.getByRole('button', { name: /Empresariales/ }).click();
    await expect(page.getByRole('article')).toHaveCount(6);
    await expect(page.getByRole('link', { name: /Ver en GitHub/ })).toHaveCount(0);
    await filters.getByRole('button', { name: /Abiertos y académicos/ }).click();
    await expect(page.getByRole('article')).toHaveCount(5);
    await expect(page.getByRole('link', { name: /Ver en GitHub/ }).first()).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  test('«Descargar HV» entrega el PDF del idioma activo', async ({ page, request }) => {
    for (const [lang, label] of [
      ['es', 'Descargar HV'],
      ['en', 'Download CV'],
    ] as const) {
      await page.goto(`/${lang}`);
      const href = await page.getByRole('link', { name: label }).first().getAttribute('href');
      expect(href).toBe(`/media/cv/CV_Jarlin_Fonseca_${lang.toUpperCase()}.pdf`);
      const res = await request.get(href ?? '');
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/pdf');
    }
  });

  test('contacto: mailto y redes en pestaña nueva', async ({ page }) => {
    await page.goto('/es');
    await expect(page.getByRole('link', { name: /Escribir a/ })).toHaveAttribute('href', /^mailto:/);
    await expect(page.getByRole('link', { name: /LinkedIn/ })).toHaveAttribute('target', '_blank');
  });
});
