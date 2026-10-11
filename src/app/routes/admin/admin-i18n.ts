import adminEn from '@/i18n/locales/admin.en.json';
import adminEs from '@/i18n/locales/admin.es.json';
import { addNamespace } from '@/lib/i18n';

// Los textos del admin se cargan solo con las rutas del admin: nunca entran al bundle del sitio público.
addNamespace('es', 'admin', adminEs);
addNamespace('en', 'admin', adminEn);

export const ADMIN_NS = 'admin';
