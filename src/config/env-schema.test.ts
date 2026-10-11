import { describe, expect, it } from 'vitest';
import { parseEnv } from './env-schema';

const base = { VITE_SITE_URL: 'https://jarlin.dev/' };

describe('parseEnv', () => {
  it('aplica valores por defecto y normaliza la URL del sitio', () => {
    const env = parseEnv(base);
    expect(env).toMatchObject({
      DATA_SOURCE: 'static',
      API_BASE_URL: '/api',
      SITE_URL: 'https://jarlin.dev',
      ENABLE_ADMIN: false,
      ENABLE_MSW: false,
    });
  });

  it('convierte los booleanos', () => {
    expect(parseEnv({ ...base, VITE_ENABLE_ADMIN: 'true' }).ENABLE_ADMIN).toBe(true);
  });

  it('falla si falta la URL del sitio o un valor es inválido', () => {
    expect(() => parseEnv({})).toThrow(/Variables de entorno inválidas/);
    expect(() => parseEnv({ ...base, VITE_DATA_SOURCE: 'graphql' })).toThrow();
  });

  it('en el build, modo api exige API_BUILD_URL', () => {
    expect(() => parseEnv({ ...base, VITE_DATA_SOURCE: 'api' }, {}, true)).toThrow(/API_BUILD_URL/);
    expect(
      parseEnv({ ...base, VITE_DATA_SOURCE: 'api' }, { API_BUILD_URL: 'https://jarlin.dev/api' }, true)
        .API_BUILD_URL,
    ).toBe('https://jarlin.dev/api');
    // en el navegador no aplica
    expect(parseEnv({ ...base, VITE_DATA_SOURCE: 'api' }).DATA_SOURCE).toBe('api');
  });
});
