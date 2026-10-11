import { describe, expect, it } from 'vitest';
import { isLang, parseLang } from './lang';
import { portfolioQuery } from './query';
import { createPortfolioSource } from './source';

describe('createPortfolioSource', () => {
  it('en modo estático entrega los datos de la HV validados con el contrato', async () => {
    const data = await createPortfolioSource().getPortfolio('en');
    expect(data.lang).toBe('en');
    expect(data.profile.fullName).toBe('Jarlin Andrés Fonseca Bermón');
  });

  it('la consulta no revalida en modo estático, pero su función usa la fuente', async () => {
    const query = portfolioQuery('es');
    expect(query.enabled).toBe(false);
    expect(query.queryKey).toEqual(['public-portfolio', 'es']);
    const queryFn = query.queryFn as unknown as (ctx: { signal: AbortSignal }) => Promise<{ lang: string }>;
    await expect(queryFn({ signal: new AbortController().signal })).resolves.toMatchObject({ lang: 'es' });
  });
});

describe('lang', () => {
  it('isLang y parseLang', () => {
    expect(isLang('es')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(parseLang('en')).toBe('en');
    expect(() => parseLang('fr')).toThrow('Idioma no soportado: fr');
  });
});
