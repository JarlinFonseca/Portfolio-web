import { delay, http, HttpResponse, type JsonBodyType, type PathParams } from 'msw';
import {
  adminCertificationSchema,
  adminEducationSchema,
  adminExperienceSchema,
  adminHighlightsSchema,
  adminLanguageSchema,
  adminProfileSchema,
  adminProjectSchema,
  adminStackSchema,
  type AdminProject,
  type PortfolioContent,
} from '@/api/admin/model';
import { resolveLocalized } from '@/api/public-portfolio/resolve-localized';
import { isLang, publicPortfolioSchema } from '@/api/public-portfolio/schema';
import { db, newId, persist } from './db';

/**
 * Un handler por endpoint de la arquitectura (sección 4.12), con datos en memoria a partir del seed.
 * Las respuestas de error siguen application/problem+json (RFC 9457).
 */
const API = '*/api';
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const latency = () => (import.meta.env.VITEST ? Promise.resolve() : delay(250));

function problem(status: number, code: string, detail: string, errors?: Record<string, string>) {
  return HttpResponse.json(
    { type: `https://portfolio/errors/${code.toLowerCase()}`, title: code, status, code, detail, errors },
    { status, headers: { 'Content-Type': 'application/problem+json' } },
  );
}

const unauthorized = () => problem(401, 'UNAUTHORIZED', 'Sesión no válida o vencida');
const notFound = () => problem(404, 'NOT_FOUND', 'El recurso no existe');
const ok = (body: JsonBodyType, status = 200) => HttpResponse.json(body, { status });

async function readJson<T>(request: Request): Promise<T> {
  return (await request.json()) as T;
}

/** Archivo de un multipart (sin instanceof: en pruebas conviven el File de jsdom y el de Node). */
const isFile = (value: unknown): value is File =>
  typeof value === 'object' && value !== null && 'arrayBuffer' in value && 'name' in value;

/** Guarda el archivo y devuelve una ruta del mismo dominio (/media/...), como la API real. */
async function storeFile(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const key = `${newId('file')}-${file.name.replace(/[^\w.-]+/g, '-')}`;
  db.files[key] = { type: file.type, base64: btoa(binary) };
  return `/media/mock/${key}`;
}

/** Envuelve un handler del admin: exige sesión y simula latencia. */
function admin<P extends Record<string, string> = Record<string, string>>(
  fn: (args: { request: Request; params: P }) => Promise<Response> | Response,
) {
  return async ({ request, params }: { request: Request; params: PathParams }) => {
    await latency();
    if (!db.session) return unauthorized();
    return fn({ request, params: params as P });
  };
}

// ── Trayectoria: colecciones genéricas ──────────────────────────────────────────────
const careerCollections = {
  experiences: { key: 'experience', schema: adminExperienceSchema, prefix: 'exp', orderable: false },
  educations: { key: 'education', schema: adminEducationSchema, prefix: 'edu', orderable: true },
  certifications: {
    key: 'certifications',
    schema: adminCertificationSchema,
    prefix: 'cert',
    orderable: true,
  },
  languages: { key: 'languages', schema: adminLanguageSchema, prefix: 'lang', orderable: true },
} as const;

type CareerPath = keyof typeof careerCollections;
type CareerKey = (typeof careerCollections)[CareerPath]['key'];
type CareerItem = PortfolioContent[CareerKey][number];

function careerList(key: CareerKey): CareerItem[] {
  return db.content[key] as CareerItem[];
}

const careerHandlers = (Object.keys(careerCollections) as CareerPath[]).flatMap((path) => {
  const { key, schema, prefix, orderable } = careerCollections[path];
  const base = `${API}/admin/${path}`;
  return [
    http.get(
      base,
      admin(() => ok(careerList(key))),
    ),
    http.post(
      base,
      admin(async ({ request }) => {
        const body = await readJson<Record<string, unknown>>(request);
        const parsed = schema.safeParse({ ...body, id: newId(prefix) });
        if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos inválidos');
        careerList(key).push(parsed.data);
        persist();
        return ok(parsed.data, 201);
      }),
    ),
    ...(orderable
      ? [
          http.patch(
            `${base}/order`,
            admin(async ({ request }) => {
              const { ids } = await readJson<{ ids: string[] }>(request);
              const list = careerList(key);
              const sorted = ids.map((id) => list.find((i) => i.id === id)).filter((i) => i !== undefined);
              if (sorted.length !== list.length) return problem(422, 'VALIDATION_ERROR', 'Orden incompleto');
              (db.content[key] as CareerItem[]) = sorted;
              persist();
              return new HttpResponse(null, { status: 204 });
            }),
          ),
        ]
      : []),
    http.put(
      `${base}/:id`,
      admin<{ id: string }>(async ({ request, params }) => {
        const list = careerList(key);
        const index = list.findIndex((i) => i.id === params.id);
        if (index < 0) return notFound();
        const body = await readJson<Record<string, unknown>>(request);
        const parsed = schema.safeParse({ ...body, id: params.id });
        if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos inválidos');
        list[index] = parsed.data;
        persist();
        return ok(parsed.data);
      }),
    ),
    http.delete(
      `${base}/:id`,
      admin<{ id: string }>(({ params }) => {
        const list = careerList(key);
        const index = list.findIndex((i) => i.id === params.id);
        if (index < 0) return notFound();
        list.splice(index, 1);
        persist();
        return new HttpResponse(null, { status: 204 });
      }),
    ),
  ];
});

// ── Proyectos ───────────────────────────────────────────────────────────────────────
const findProject = (id: string) => db.content.projects.find((p) => p.id === id);

function validateProject(body: Partial<AdminProject>): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!body.title?.es?.trim()) errors['title.es'] = 'El título en español es obligatorio';
  if (!body.description?.es?.trim()) errors['description.es'] = 'La descripción en español es obligatoria';
  if (!body.organization?.trim()) errors.organization = 'La organización es obligatoria';
  if (!body.technologies?.length) errors.technologies = 'Agrega al menos una tecnología';
  return errors;
}

/** RN-02: un proyecto privado nunca guarda repositorio. */
const normalizeProject = (p: AdminProject): AdminProject =>
  p.type === 'PRIVATE' ? { ...p, repositoryUrl: null } : p;

const projectHandlers = [
  http.get(
    `${API}/admin/projects`,
    admin(() => ok(db.content.projects)),
  ),
  http.post(
    `${API}/admin/projects`,
    admin(async ({ request }) => {
      const body = await readJson<Partial<AdminProject>>(request);
      const errors = validateProject(body);
      if (Object.keys(errors).length)
        return problem(422, 'VALIDATION_ERROR', 'Revisa los campos marcados', errors);
      const parsed = adminProjectSchema.safeParse({
        ...body,
        id: newId('prj'),
        images: [],
        coverImageId: null,
        version: 1,
      });
      if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos inválidos');
      const project = normalizeProject(parsed.data);
      db.content.projects.push(project);
      persist();
      return ok(project, 201);
    }),
  ),
  http.patch(
    `${API}/admin/projects/order`,
    admin(async ({ request }) => {
      const { ids } = await readJson<{ ids: string[] }>(request);
      const sorted = ids.map((id) => findProject(id)).filter((p) => p !== undefined);
      if (sorted.length !== db.content.projects.length)
        return problem(422, 'VALIDATION_ERROR', 'Orden incompleto');
      db.content.projects = sorted;
      persist();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.get(
    `${API}/admin/projects/:id`,
    admin<{ id: string }>(({ params }) => {
      const project = findProject(params.id);
      return project ? ok(project) : notFound();
    }),
  ),
  http.put(
    `${API}/admin/projects/:id`,
    admin<{ id: string }>(async ({ request, params }) => {
      const current = findProject(params.id);
      if (!current) return notFound();
      const body = await readJson<Partial<AdminProject>>(request);
      if (body.version !== undefined && body.version !== current.version) {
        return problem(409, 'CONFLICT', 'Otra pestaña guardó cambios. Recarga para continuar');
      }
      const errors = validateProject(body);
      if (Object.keys(errors).length)
        return problem(422, 'VALIDATION_ERROR', 'Revisa los campos marcados', errors);
      const parsed = adminProjectSchema.safeParse({
        ...current,
        ...body,
        id: current.id,
        images: current.images,
        coverImageId: current.coverImageId,
        version: current.version + 1,
      });
      if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos inválidos');
      const updated = normalizeProject(parsed.data);
      db.content.projects = db.content.projects.map((p) => (p.id === current.id ? updated : p));
      persist();
      return ok(updated);
    }),
  ),
  http.patch(
    `${API}/admin/projects/:id/visibility`,
    admin<{ id: string }>(async ({ request, params }) => {
      const project = findProject(params.id);
      if (!project) return notFound();
      const { visible } = await readJson<{ visible: boolean }>(request);
      project.visible = visible;
      project.version += 1;
      persist();
      return ok(project);
    }),
  ),
  http.delete(
    `${API}/admin/projects/:id`,
    admin<{ id: string }>(({ params }) => {
      if (!findProject(params.id)) return notFound();
      // RN-06: se borran también sus imágenes
      db.content.projects = db.content.projects.filter((p) => p.id !== params.id);
      persist();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.post(
    `${API}/admin/projects/:id/images`,
    admin<{ id: string }>(async ({ request, params }) => {
      const project = findProject(params.id);
      if (!project) return notFound();
      const form = await request.formData();
      const file = form.get('file');
      if (!isFile(file)) return problem(422, 'VALIDATION_ERROR', 'Falta el archivo');
      if (!IMAGE_TYPES.includes(file.type))
        return problem(422, 'INVALID_FILE_TYPE', 'Solo se aceptan PNG, JPG o WebP');
      if (file.size > MAX_IMAGE_BYTES) return problem(422, 'FILE_TOO_LARGE', 'La imagen supera 5 MB');
      const image = { id: newId('img'), url: await storeFile(file), alt: String(form.get('alt') ?? '') };
      project.images.push(image);
      project.coverImageId ??= image.id; // la primera imagen es la portada
      persist();
      return ok({ ...image, isCover: project.coverImageId === image.id }, 201);
    }),
  ),
  http.patch(
    `${API}/admin/projects/:id/images/:imageId`,
    admin<{ id: string; imageId: string }>(async ({ request, params }) => {
      const project = findProject(params.id);
      const image = project?.images.find((i) => i.id === params.imageId);
      if (!project || !image) return notFound();
      const body = await readJson<{ alt?: string; cover?: boolean }>(request);
      if (body.alt !== undefined) image.alt = body.alt;
      if (body.cover) project.coverImageId = image.id;
      persist();
      return ok({ ...image, isCover: project.coverImageId === image.id });
    }),
  ),
  http.delete(
    `${API}/admin/projects/:id/images/:imageId`,
    admin<{ id: string; imageId: string }>(({ params }) => {
      const project = findProject(params.id);
      if (!project?.images.some((i) => i.id === params.imageId)) return notFound();
      project.images = project.images.filter((i) => i.id !== params.imageId);
      if (project.coverImageId === params.imageId) project.coverImageId = project.images[0]?.id ?? null;
      persist();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];

// ── Stack, cifras y principios, perfil y cuenta ─────────────────────────────────────
const contentHandlers = [
  http.get(
    `${API}/admin/stack`,
    admin(() => ok(db.content.stack)),
  ),
  http.put(
    `${API}/admin/stack`,
    admin(async ({ request }) => {
      const parsed = adminStackSchema.safeParse(await request.json());
      if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos del stack inválidos');
      const all = parsed.data.categories.flatMap((c) => c.technologies);
      const missing = parsed.data.cube.findIndex((t) => !t || !all.includes(t));
      if (missing >= 0) {
        return problem(422, 'CUBE_FACE_INVALID', `Elige una tecnología para la cara ${missing + 1}`, {
          [`cube.${missing}`]: 'Elige una tecnología registrada',
        });
      }
      db.content.stack = parsed.data;
      persist();
      return ok(db.content.stack);
    }),
  ),
  http.get(
    `${API}/admin/highlights`,
    admin(() => ok(db.content.highlights)),
  ),
  http.put(
    `${API}/admin/highlights`,
    admin(async ({ request }) => {
      const parsed = adminHighlightsSchema.safeParse(await request.json());
      if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos inválidos');
      const invalid =
        parsed.data.stats.some((s) => !s.value.trim() || !s.label.es.trim()) ||
        parsed.data.principles.some((p) => !p.title.es.trim() || !p.text.es.trim());
      if (invalid) return problem(422, 'VALIDATION_ERROR', 'Completa los campos obligatorios en español');
      db.content.highlights = parsed.data;
      persist();
      return ok(db.content.highlights);
    }),
  ),
  http.get(
    `${API}/admin/profile`,
    admin(() => ok(db.content.profile)),
  ),
  http.put(
    `${API}/admin/profile`,
    admin(async ({ request }) => {
      const body = await readJson<Record<string, unknown>>(request);
      const parsed = adminProfileSchema.safeParse({
        ...body,
        photoUrl: db.content.profile.photoUrl,
        resume: db.content.profile.resume,
      });
      if (!parsed.success) return problem(422, 'VALIDATION_ERROR', 'Datos del perfil inválidos');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.data.email)) {
        return problem(422, 'VALIDATION_ERROR', 'Correo inválido', { email: 'Escribe un correo válido' });
      }
      db.content.profile = parsed.data;
      persist();
      return ok(db.content.profile);
    }),
  ),
  http.put(
    `${API}/admin/profile/photo`,
    admin(async ({ request }) => {
      const file = (await request.formData()).get('file');
      if (!isFile(file)) return problem(422, 'VALIDATION_ERROR', 'Falta el archivo');
      if (!IMAGE_TYPES.includes(file.type))
        return problem(422, 'INVALID_FILE_TYPE', 'Solo se aceptan JPG, PNG o WebP');
      if (file.size > MAX_IMAGE_BYTES) return problem(422, 'FILE_TOO_LARGE', 'La imagen supera 5 MB');
      db.content.profile.photoUrl = await storeFile(file);
      persist();
      return ok({ url: db.content.profile.photoUrl });
    }),
  ),
  http.delete(
    `${API}/admin/profile/photo`,
    admin(() => {
      db.content.profile.photoUrl = null;
      persist();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
  http.put(
    `${API}/admin/profile/resume/:lang`,
    admin<{ lang: string }>(async ({ request, params }) => {
      if (!isLang(params.lang)) return notFound();
      const file = (await request.formData()).get('file');
      if (!isFile(file)) return problem(422, 'VALIDATION_ERROR', 'Falta el archivo');
      if (file.type !== 'application/pdf')
        return problem(422, 'INVALID_FILE_TYPE', 'Solo se aceptan archivos PDF');
      if (file.size > MAX_PDF_BYTES) return problem(422, 'FILE_TOO_LARGE', 'El PDF supera 10 MB');
      db.content.profile.resume[params.lang] = { fileName: file.name, url: await storeFile(file) };
      persist();
      return ok(db.content.profile.resume[params.lang]);
    }),
  ),
  http.get(
    `${API}/admin/account`,
    admin(() => ok({ loginEmail: db.account.loginEmail })),
  ),
  http.put(
    `${API}/admin/account/email`,
    admin(async ({ request }) => {
      const { email } = await readJson<{ email: string }>(request);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? '')) {
        return problem(422, 'VALIDATION_ERROR', 'Correo inválido', { email: 'Escribe un correo válido' });
      }
      db.account.loginEmail = email.trim().toLowerCase();
      if (db.session) db.session.email = db.account.loginEmail;
      persist();
      return ok({ loginEmail: db.account.loginEmail });
    }),
  ),
  http.put(
    `${API}/admin/account/password`,
    admin(async ({ request }) => {
      const body = await readJson<{ currentPassword: string; newPassword: string }>(request);
      if (body.currentPassword !== db.account.password) {
        return problem(422, 'WRONG_PASSWORD', 'La contraseña actual no es correcta', {
          currentPassword: 'La contraseña actual no es correcta',
        });
      }
      if ((body.newPassword ?? '').length < 10) {
        return problem(422, 'WEAK_PASSWORD', 'La nueva contraseña debe tener al menos 10 caracteres', {
          newPassword: 'Mínimo 10 caracteres',
        });
      }
      db.account.password = body.newPassword;
      persist();
      return new HttpResponse(null, { status: 204 });
    }),
  ),
];

// ── Sesión y API pública ────────────────────────────────────────────────────────────
const authHandlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    await latency();
    const { email, password, remember } = await readJson<{
      email: string;
      password: string;
      remember?: boolean;
    }>(request);
    const valid = email?.trim().toLowerCase() === db.account.loginEmail && password === db.account.password;
    if (!valid) {
      db.failedLogins += 1;
      persist();
      // RF-AUT-02: no se indica cuál de los dos falló
      return problem(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos');
    }
    db.failedLogins = 0;
    db.session = { email: db.account.loginEmail, remember: !!remember };
    persist();
    return ok({ email: db.account.loginEmail });
  }),
  http.post(`${API}/auth/logout`, async () => {
    await latency();
    db.session = null;
    persist();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get(`${API}/auth/me`, async () => {
    await latency();
    return db.session ? ok({ email: db.session.email }) : unauthorized();
  }),
];

const mediaHandlers = [
  http.get('*/media/mock/:key', ({ params }) => {
    const file = db.files[String(params.key)];
    if (!file) return new HttpResponse(null, { status: 404 });
    const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
    return new HttpResponse(bytes, { headers: { 'Content-Type': file.type } });
  }),
];

const publicHandlers = [
  http.get(`${API}/public/portfolio`, async ({ request }) => {
    await latency();
    const lang = new URL(request.url).searchParams.get('lang');
    if (!isLang(lang)) return problem(400, 'INVALID_LANG', 'Idioma no soportado');
    return ok(publicPortfolioSchema.parse(resolveLocalized(db.content, lang)));
  }),
];

export const handlers = [
  ...mediaHandlers,
  ...publicHandlers,
  ...authHandlers,
  ...projectHandlers,
  ...careerHandlers,
  ...contentHandlers,
];
