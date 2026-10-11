import i18next, { type i18n as I18n } from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Lang } from '@/api/public-portfolio/schema';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

export const defaultNS = 'common';
export const resources = { es: { common: es }, en: { common: en } } as const;

/**
 * Una instancia por idioma, creada de forma síncrona (recursos en el bundle).
 * Así el pre-render de /es y /en nunca comparte estado ni depende del navegador.
 */
const instances = new Map<Lang, I18n>();

export function getI18n(lang: Lang): I18n {
  let instance = instances.get(lang);
  if (!instance) {
    instance = i18next.createInstance();
    void instance.use(initReactI18next).init({
      lng: lang,
      fallbackLng: 'es',
      defaultNS,
      ns: [defaultNS],
      resources,
      initAsync: false,
      interpolation: { escapeValue: false }, // React ya escapa
      returnNull: false,
    });
    instances.set(lang, instance);
  }
  return instance;
}

/** Agrega un espacio de nombres cargado bajo demanda (por ejemplo, el del admin). */
export function addNamespace(lang: Lang, ns: string, bundle: Record<string, unknown>) {
  const instance = getI18n(lang);
  if (!instance.hasResourceBundle(lang, ns)) instance.addResourceBundle(lang, ns, bundle, true, true);
  return instance;
}
