import 'i18next';
import type admin from '@/i18n/locales/admin.es.json';
import type common from '@/i18n/locales/es.json';

// Claves tipadas: t('projects.filter.privat') falla al compilar.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: { common: typeof common; admin: typeof admin };
  }
}
