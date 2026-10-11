/**
 * Idiomas del sitio sin dependencias: lo usa el código del navegador (rutas, selector de idioma)
 * para no cargar Zod en el bundle inicial. El esquema Zod (schema.ts) reutiliza esta lista.
 */
export const LANGS = ['es', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

/** Lanza si el parámetro de la URL no es un idioma soportado. */
export function parseLang(value: unknown): Lang {
  if (!isLang(value)) throw new Error(`Idioma no soportado: ${String(value)}`);
  return value;
}
