import { beforeEach, describe, expect, it } from 'vitest';
import type { AdminProject } from '@/api/admin/model';
import { db } from './db';

const API = 'http://localhost:3000/api';
const json = (body: unknown) => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
});

describe('mocks del admin', () => {
  beforeEach(() => {
    db.session = { email: 'admin@test.dev', remember: false };
  });

  it('regresión QA A09: tras subir una imagen, el proyecto se puede volver a guardar', async () => {
    const form = new FormData();
    form.append(
      'file',
      new File([new Uint8Array([137, 80, 78, 71])], 'captura 1.png', { type: 'image/png' }),
    );
    form.append('alt', 'Captura');
    const upload = await fetch(`${API}/admin/projects/food-court/images`, { method: 'POST', body: form });
    expect(upload.status).toBe(201);
    const image = (await upload.json()) as { url: string };
    expect(image.url).toMatch(/^\/media\/mock\/file-/); // ruta del mismo dominio, nunca blob:

    // el archivo se sirve en la ruta devuelta, como S3 + CloudFront
    const media = await fetch(`http://localhost:3000${image.url}`);
    expect(media.headers.get('content-type')).toBe('image/png');

    const project = db.content.projects.find((p) => p.id === 'food-court') as AdminProject;
    const put = await fetch(`${API}/admin/projects/food-court`, { method: 'PUT', ...json(project) });
    expect(put.status).toBe(200);
  });

  it('el perfil se puede guardar después de cambiar la foto', async () => {
    const form = new FormData();
    form.append('file', new File([new Uint8Array([1])], 'foto.webp', { type: 'image/webp' }));
    expect((await fetch(`${API}/admin/profile/photo`, { method: 'PUT', body: form })).status).toBe(200);
    const put = await fetch(`${API}/admin/profile`, { method: 'PUT', ...json(db.content.profile) });
    expect(put.status).toBe(200);
  });

  it('sin sesión las rutas del admin responden 401 en formato problem+json', async () => {
    db.session = null;
    const res = await fetch(`${API}/admin/projects`);
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toContain('application/problem+json');
  });
});
