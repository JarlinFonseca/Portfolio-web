import type { Lang } from '@/api/public-portfolio/schema';

const MONTHS: Record<Lang, readonly string[]> = {
  es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

const PRESENT: Record<Lang, string> = { es: 'hoy', en: 'now' };

function parts(yearMonth: string) {
  const [year = '', month = '1'] = yearMonth.split('-');
  return { year, month: MONTHS.es[Number(month) - 1] ? Number(month) - 1 : 0 };
}

/** "2024-02" → "Feb 2024" (con mayúscula inicial en ambos idiomas). */
export function formatMonth(yearMonth: string, lang: Lang): string {
  const { year, month } = parts(yearMonth);
  return `${MONTHS[lang][month]} ${year}`;
}

/**
 * Rango de fechas: "Feb 2024 — hoy", "Mar — Sep 2023" (mismo año) o "Feb 2018 — Nov 2023".
 * Usa el guion largo del diseño.
 */
export function formatRange(start: string | null, end: string | null, lang: Lang, current = false): string {
  if (!start) return end ? formatMonth(end, lang) : '';
  if (current || !end) return `${formatMonth(start, lang)} — ${PRESENT[lang]}`;
  const s = parts(start);
  const e = parts(end);
  if (s.year === e.year) {
    return s.month === e.month
      ? formatMonth(end, lang)
      : `${MONTHS[lang][s.month]} — ${formatMonth(end, lang)}`;
  }
  return `${formatMonth(start, lang)} — ${formatMonth(end, lang)}`;
}

/** Año del mes, para listas compactas ("AWS · 2023"). */
export const yearOf = (yearMonth: string | null) => (yearMonth ? yearMonth.slice(0, 4) : '');
