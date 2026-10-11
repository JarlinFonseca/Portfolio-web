import { expect, type Page, test } from '@playwright/test';

const EMAIL = 'admin@jarlinfonseca.dev';
const PASSWORD = 'Portfolio2026!';

async function login(page: Page, path = '/admin/projects') {
  await page.goto(path);
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Correo electrónico').fill(EMAIL);
  await page.getByLabel('Contraseña', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Ingresar' }).click();
}

test.describe('panel admin (MSW)', () => {
  test('protege las rutas, inicia sesión y vuelve a la ruta pedida; cerrar sesión invalida', async ({
    page,
  }) => {
    await login(page, '/admin/stack');
    await expect(page).toHaveURL(/\/admin\/stack$/);
    await expect(page.getByRole('heading', { name: 'Stack tecnológico' })).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL(/\/admin\/login\?reason=logout/);
    await page.goto('/admin/projects');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('crea un proyecto abierto con validaciones y aparece en la lista', async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: 'Nuevo proyecto' }).click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('El título en español es obligatorio', { exact: true })).toBeVisible();
    await expect(page.getByText('Agrega al menos una tecnología', { exact: true })).toBeVisible();

    await page.getByLabel(/^Título/).fill('Portfolio personal');
    await page.getByLabel('Empresa / organización').fill('Proyecto propio');
    await page.getByLabel(/^Descripción/).fill('Sitio bilingüe con React Router y API en Spring WebFlux.');
    await page.getByText('Abierto o académico').click();
    await page.getByLabel('Enlace al repositorio o demo').fill('https://github.com/JarlinFonseca/portfolio');
    const tech = page.getByPlaceholder('Escribe y presiona Enter');
    await tech.fill('React');
    await tech.press('Enter');
    // vista previa en vivo
    await expect(page.locator('aside h4', { hasText: 'Portfolio personal' })).toBeVisible();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page).toHaveURL(/\/admin\/projects$/);
    await expect(page.getByText('Proyecto creado y publicado en el sitio', { exact: true })).toBeVisible();
    await expect(page.getByText('Portfolio personal', { exact: true })).toBeVisible();
  });

  test('al cancelar con cambios sin guardar pide confirmación', async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: 'Editar «SAGIS»' }).click();
    await page.getByLabel(/^Título/).fill('SAGIS v2');
    await page.getByRole('link', { name: 'Cancelar' }).click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toContainText('Tienes cambios sin guardar');
    await dialog.getByRole('button', { name: 'Seguir editando' }).click();
    await expect(page.getByLabel(/^Título/)).toHaveValue('SAGIS v2');
  });

  test('trayectoria: valida fechas y guarda una experiencia', async ({ page }) => {
    await login(page, '/admin/career');
    await page.getByRole('button', { name: 'Nueva experiencia' }).click();
    await page.getByLabel('Empresa').fill('No Country');
    await page.getByLabel('Cargo (ES)').fill('Desarrollador Backend');
    await page.getByLabel('Resumen (ES)').fill('API educativa en Spring Boot.');
    await page.getByLabel('Inicio').fill('2023-12');
    await page.getByLabel('Fin').fill('2023-11');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(
      page.getByText('La fecha de fin no puede ser anterior a la de inicio', { exact: true }),
    ).toBeVisible();
    await page.getByLabel('Fin').fill('2023-12');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(page.getByText('Registro guardado y publicado', { exact: true })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Experiencia/ })).toContainText('4');
  });

  test('stack: quitar una tecnología del cubo libera la cara y bloquea el guardado', async ({ page }) => {
    await login(page, '/admin/stack');
    await page.getByRole('button', { name: 'Quitar «Docker»' }).click();
    await expect(
      page
        .getByRole('region', { name: /Notifications/ })
        .getByText(/Quitaste «Docker», que estaba en la cara 6/),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Elige una tecnología para cada cara del cubo').first()).toBeVisible();
    await page.getByLabel('Cara 6').selectOption('Kubernetes');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados y publicados en el sitio', { exact: true })).toBeVisible();
  });

  test('cifras y perfil: guarda y confirma la publicación', async ({ page }) => {
    await login(page, '/admin/highlights');
    await page.getByRole('switch', { name: 'Mostrar la cifra «3» en el sitio' }).click();
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados y publicados en el sitio', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Perfil, enlaces y CV' }).click();
    await page.getByLabel('Correo de contacto').fill('correo-invalido');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Escribe un correo válido', { exact: true })).toBeVisible();
    await page.getByLabel('Correo de contacto').fill('jarlinandres5000@gmail.com');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Cambios guardados y publicados en el sitio', { exact: true })).toBeVisible();
  });
});
