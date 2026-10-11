import type { ProjectType } from '@/api/public-portfolio/schema';

export type ProjectFilterValue = 'all' | 'private' | 'open';

const TYPE_BY_FILTER: Record<Exclude<ProjectFilterValue, 'all'>, ProjectType> = {
  private: 'PRIVATE',
  open: 'OPEN',
};

export function matchesFilter(type: ProjectType, filter: ProjectFilterValue): boolean {
  return filter === 'all' || TYPE_BY_FILTER[filter] === type;
}

/** Devuelve una lista nueva con los proyectos del filtro, sin alterar el orden recibido. */
export function filterProjects<T extends { type: ProjectType }>(
  projects: readonly T[],
  filter: ProjectFilterValue,
): T[] {
  return projects.filter((p) => matchesFilter(p.type, filter));
}

/** Cantidad de proyectos por filtro. */
export function countByFilter(
  projects: readonly { type: ProjectType }[],
): Record<ProjectFilterValue, number> {
  return {
    all: projects.length,
    private: projects.filter((p) => p.type === 'PRIVATE').length,
    open: projects.filter((p) => p.type === 'OPEN').length,
  };
}
