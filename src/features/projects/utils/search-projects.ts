import type { AdminProject } from '@/api/admin/model';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Búsqueda por título (ES/EN), organización o tecnología, sin distinguir tildes ni mayúsculas. */
export function searchProjects(projects: readonly AdminProject[], query: string): AdminProject[] {
  const q = normalize(query);
  if (!q) return [...projects];
  return projects.filter((p) =>
    [p.title.es, p.title.en, p.organization, ...p.technologies].some((field) => normalize(field).includes(q)),
  );
}
