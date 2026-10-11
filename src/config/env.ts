/**
 * Variables de entorno ya validadas en el build (ver env-schema.ts y vite.config.ts).
 * Aquí solo se leen y tipan, para no cargar Zod en el navegador.
 */
const raw = import.meta.env;
const isServer = typeof window === 'undefined';
const flag = (value: unknown) => value === 'true';
const nonEmpty = (value: unknown) => (typeof value === 'string' && value !== '' ? value : undefined);

export const env = {
  DATA_SOURCE: raw.VITE_DATA_SOURCE === 'api' ? 'api' : 'static',
  API_BASE_URL: nonEmpty(raw.VITE_API_BASE_URL) ?? '/api',
  // Sin prefijo VITE_: solo existe en Node (pre-render), nunca en el bundle del navegador
  API_BUILD_URL: isServer && typeof process !== 'undefined' ? nonEmpty(process.env.API_BUILD_URL) : undefined,
  SITE_URL: (nonEmpty(raw.VITE_SITE_URL) ?? '').replace(/\/$/, ''),
  ENABLE_ADMIN: flag(raw.VITE_ENABLE_ADMIN),
  ENABLE_MSW: flag(raw.VITE_ENABLE_MSW),
  ENABLE_WEBGL_HERO: flag(raw.VITE_ENABLE_WEBGL_HERO),
} as const satisfies Record<string, string | boolean | undefined>;

export type Env = typeof env;
