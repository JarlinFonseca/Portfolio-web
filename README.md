# portfolio-web

Frontend del portfolio de Jarlin Fonseca: sitio público bilingüe (ES/EN) pre-renderizado y panel administrativo.
Implementa el plan `04-plan-frontend.md` (releases **R1** y **R2**) a partir de los insumos de `../insumos-portfolio-jarlin-fonseca`.

| Release                                         | Estado                                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| **R1 · Sitio público** (datos estáticos, AWS)   | Construido. Falta ejecutar el despliegue con la cuenta de AWS (ver «Despliegue»)     |
| **R2 · Panel admin** (las 7 pantallas, con MSW) | Construido. Funciona en desarrollo contra mocks; en producción queda fuera del build |
| R3 · Integración con la API                     | Pendiente del backend: cambiar `VITE_DATA_SOURCE=api` y `VITE_ENABLE_ADMIN=true`     |
| R4 · Mejoras de acceso (HU-07, 08, 09)          | Pendiente (depende de R3)                                                            |

## Requisitos

- Node **22.22+** (`.nvmrc`) y **pnpm 10** mediante Corepack: `corepack enable` (o `corepack pnpm …` sin permisos de administrador).

## Comandos

| Comando                                              | Qué hace                                                                                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                           | Desarrollo en <http://localhost:5173>. El admin está en `/admin` y usa **MSW** (datos en memoria)        |
| `pnpm build`                                         | Build de producción: pre-render de `/es` y `/en`, SPA fallback, `sitemap.xml` y `robots.txt`             |
| `pnpm preview`                                       | Sirve `build/client` en <http://localhost:4173> **con la misma CloudFront Function** de producción       |
| `pnpm test` / `pnpm test:coverage`                   | Vitest: unidad, componentes, contrato y fuente HTTP (cobertura ≥ 80 % en `api`, `lib` y `utils`)         |
| `pnpm test:e2e`                                      | Playwright: sitio público (escritorio y móvil a 360 px), axe WCAG 2.2 AA y flujos del admin              |
| `pnpm test:edge`                                     | Enrutamiento en el borde: CloudFront Function, copia en CloudFormation y `vercel.json` (deben coincidir) |
| `pnpm lint` · `pnpm typecheck` · `pnpm format:check` | ESLint (con reglas de capas), TypeScript estricto y Prettier                                             |
| `node scripts/generate-og.mjs`                       | Regenera `public/og-image-{es,en}.png`                                                                   |

**Acceso al admin en desarrollo (MSW):** `admin@jarlinfonseca.dev` / `Portfolio2026!`. Los datos simulados viven en
`sessionStorage`: cerrar la pestaña los reinicia. Con `VITE_DATA_SOURCE=api` en `.env.development.local`, el sitio
público también lee de MSW y refleja al instante lo que se guarda en el admin (RN-05).

## Arquitectura

```
src/
├─ app/          rutas (React Router v8 en modo framework), layouts, providers, entry.client (arranque de MSW)
├─ features/     hero · highlights · projects · stack · career · contact · auth · profile (aisladas entre sí)
├─ components/   UI compartida sin negocio (ui/, layout/, illustrations/, seo/)
├─ api/          contrato público (Zod), fuentes static/http, seed de la HV y modelo bilingüe del admin
├─ lib/          cliente HTTP (timeout, reintento, CSRF, RFC 9457), subida multipart con progreso, i18n, logger
├─ config/       env.ts (lectura en el navegador) y env-schema.ts (validación Zod en el build)
└─ testing/      MSW (handlers de todos los endpoints de la arquitectura 4.12), setup y render de pruebas
```

- **Flujo de dependencias** `shared → features → app`, verificado por ESLint (`import-x/no-restricted-paths`).
- **Contrato primero:** `src/api/public-portfolio/schema.ts` es el contrato de `GET /api/public/portfolio?lang=`.
  El seed, los mocks y la respuesta de la API pasan por el mismo esquema. Los componentes no saben de dónde vienen los datos.
- **Pre-render + revalidación:** el `loader` corre en el build; en el navegador TanStack Query usa esos datos como
  `initialData` y, solo en modo `api`, revalida en segundo plano. Zod y la fuente se cargan bajo demanda.
- **i18n:** idioma en la URL, una instancia de i18next por idioma (sin estado compartido en el pre-render) y claves tipadas.
  Los textos del admin están en un espacio aparte (`admin.*.json`) que el sitio público nunca descarga.

## Presupuesto y calidad (medido)

| Métrica                    | Objetivo      | Actual                                                |
| -------------------------- | ------------- | ----------------------------------------------------- |
| JS inicial de `/es` (gzip) | ≤ 180 KB      | ~166 KB                                               |
| CSS (gzip)                 | ≤ 30 KB       | ~9,5 KB                                               |
| axe en `/es` y `/en`       | 0 violaciones | 0                                                     |
| Pruebas                    | —             | 89 unitarias/componentes · 23 e2e · 20 casos de borde |

## Despliegue en AWS (R1)

1. Crear la pila en **us-east-1**: `aws cloudformation deploy --template-file infra/web-stack.yaml --stack-name portfolio-web --capabilities CAPABILITY_NAMED_IAM --parameter-overrides BudgetEmail=<correo> GitHubRepository=<owner>/<repo>`.
2. Con las salidas de la pila, definir en GitHub (ambiente `production`) las variables `WEB_BUCKET`, `CF_DISTRIBUTION_ID`,
   `AWS_DEPLOY_ROLE_ARN`, `SITE_URL` (`https://<id>.cloudfront.net` o el dominio), `DATA_SOURCE=static` y `ENABLE_ADMIN=false`.
3. Un push a `main` ejecuta `.github/workflows/deploy.yml`: build, subida a S3 en el orden correcto, invalidación y prueba de humo.

Si cambias `infra/cloudfront-function.js`, copia el cambio en `FunctionCode` de la plantilla: `pnpm test:edge` falla si no coinciden.

## Despliegue en Vercel (alternativa gratuita, plan Hobby)

`vercel.json` replica la CloudFront Function (redirección de `/` por cookie o idioma, `/es` y `/en` pre-renderizadas,
SPA fallback), las cabeceras de seguridad y la caché de `/assets`. `pnpm test:edge` verifica que se comporte igual que en AWS.

1. Subir el proyecto a un repositorio de GitHub.
2. En vercel.com: **Add New → Project → Import** el repositorio. Framework Preset: **Other** (build y salida vienen de `vercel.json`).
3. Variables de entorno: `VITE_SITE_URL=https://<proyecto>.vercel.app`, `VITE_DATA_SOURCE=static`, `VITE_ENABLE_ADMIN=false`
   y `ENABLE_EXPERIMENTAL_COREPACK=1` (para usar la versión de pnpm fijada en `packageManager`).
4. **Deploy.** Cada push a `main` vuelve a desplegar; cada rama o PR genera una URL de vista previa.

En R3, para conservar el mismo dominio que exige la cookie de sesión, se agrega en `vercel.json` un rewrite
`{ "source": "/api/:path*", "destination": "https://<api-en-aws>/api/:path*" }` antes del SPA fallback.

## Decisiones tomadas en esta implementación

| Tema               | Decisión                                                                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Versiones          | React 19.3, React Router 8.4, Vite 8.3, TypeScript **6.0** (7.0 aún no es compatible con typescript-eslint), ESLint **9** (jsx-a11y no soporta 10), pnpm 10 |
| Validación de env  | Zod en el build (`vite.config.ts`) y lectura sin Zod en el navegador (ahorra ~23 KB del JS inicial)                                                         |
| URLs de media      | El contrato acepta URL absoluta o ruta del mismo dominio (`/media/...`), como indica la arquitectura                                                        |
| Experiencia        | Orden: la actual primero y luego por fecha de inicio (coincide con el diseño)                                                                               |
| Contenido del seed | 3 experiencias (como en el diseño); 4 estudios y 5 certificaciones/cursos, de los que solo se muestran los marcados «Mostrar en el sitio»                   |
| Contraste          | El kicker «// contacto» pasa de `#DCE4FC` a `#EEF2FE` sobre cobalto para cumplir 4,5:1 (axe)                                                                |
| Admin en móvil     | La barra lateral se pliega bajo un botón de menú en pantallas < 1024 px                                                                                     |
| Hoja de vida       | `public/media/cv/CV_Jarlin_Fonseca_ES.pdf` y `CV_Jarlin_Fonseca_EN.pdf` (los de la carpeta HVs): «Descargar HV» entrega el del idioma activo                |
| CSP                | La plantilla incluye `'unsafe-inline'` en `script-src` mientras se calculan los hashes de los scripts de hidratación (tarea FE-029, al primer despliegue)   |

Pendientes del negocio (ver plan, sección 19): dominio, foto definitiva y capturas de proyectos.
