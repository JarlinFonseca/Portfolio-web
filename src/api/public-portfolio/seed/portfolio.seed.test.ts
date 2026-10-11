import { describe, expect, it } from 'vitest';
import { portfolioContentSchema } from '@/api/admin/model';
import { resolveLocalized } from '../resolve-localized';
import { LANGS, publicPortfolioSchema } from '../schema';
import { portfolioSeed } from './portfolio.seed';

describe('seed de la hoja de vida', () => {
  it('cumple el modelo bilingüe del admin', () => {
    expect(() => portfolioContentSchema.parse(portfolioSeed)).not.toThrow();
  });

  it.each(LANGS)('cumple el contrato público en %s', (lang) => {
    const result = publicPortfolioSchema.safeParse(resolveLocalized(portfolioSeed, lang));
    expect(result.error?.issues ?? []).toEqual([]);
  });

  it('trae el contenido esperado: 11 proyectos (6 privados, 5 abiertos), 4 cifras y 4 principios', () => {
    const data = resolveLocalized(portfolioSeed, 'es');
    expect(data.projects).toHaveLength(11);
    expect(data.projects.filter((p) => p.type === 'PRIVATE')).toHaveLength(6);
    expect(data.stats.map((s) => s.value)).toEqual(['3+', '700+', '1000+', '3']);
    expect(data.principles).toHaveLength(4);
    expect(data.stack.categories).toHaveLength(6);
  });

  it('las 6 caras del cubo existen entre las tecnologías registradas', () => {
    const all = portfolioSeed.stack.categories.flatMap((c) => c.technologies);
    portfolioSeed.stack.cube.forEach((tech) => expect(all).toContain(tech));
  });
});
