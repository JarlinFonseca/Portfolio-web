import { describe, expect, it } from 'vitest';
import { portfolioSeed } from '@/api/public-portfolio/seed/portfolio.seed';
import { searchProjects } from '../utils/search-projects';
import { projectFormSchema, toFormValues, toPreviewProject, toProjectInput } from './project-form-schema';

const issues = (values: unknown) =>
  projectFormSchema.safeParse(values).error?.issues.map((i) => `${i.path.join('.')}:${i.message}`) ?? [];

describe('projectFormSchema (RF-PRO-21)', () => {
  it('un proyecto nuevo vacío pide título, descripción, organización y tecnologías', () => {
    expect(issues(toFormValues(undefined, 12))).toEqual([
      'title.es:projectForm.errorTitleEs',
      'description.es:projectForm.errorDescriptionEs',
      'organization:projectForm.errorOrganization',
      'technologies:projectForm.errorTechnologies',
    ]);
  });

  it('un proyecto del seed es válido', () => {
    expect(issues(toFormValues(portfolioSeed.projects[0], 1))).toEqual([]);
  });

  it('en abiertos valida la URL del repositorio', () => {
    const values = { ...toFormValues(portfolioSeed.projects[6], 7), repositoryUrl: 'no-es-url' };
    expect(issues(values)).toEqual(['repositoryUrl:common.invalidUrl']);
  });
});

describe('toProjectInput', () => {
  it('RN-02: un privado nunca envía repositorio y recorta los textos', () => {
    const values = {
      ...toFormValues(portfolioSeed.projects[0], 1),
      repositoryUrl: 'https://github.com/x',
      organization: '  Nelumbo  ',
    };
    const input = toProjectInput(values, 3);
    expect(input.repositoryUrl).toBeNull();
    expect(input.organization).toBe('Nelumbo');
    expect(input.version).toBe(3);
  });
});

describe('toPreviewProject', () => {
  it('usa el español si el inglés está vacío y recorta la descripción', () => {
    const values = toFormValues(portfolioSeed.projects[0], 1);
    values.title.en = '';
    const preview = toPreviewProject(values, 'en', null, 'Nuevo');
    expect(preview.title).toBe('Portal de Garantías');
    expect(preview.description.endsWith('…')).toBe(true);
  });
});

describe('searchProjects (RF-PRO-02)', () => {
  it('busca por título, organización o tecnología sin tildes', () => {
    const titles = (q: string) => searchProjects(portfolioSeed.projects, q).map((p) => p.id);
    expect(titles('garantias')).toEqual(['warranty-portal']);
    expect(titles('no country')).toEqual(['edtech-api']);
    expect(titles('laravel')).toEqual(['sagis']);
    expect(titles('')).toHaveLength(11);
  });
});
