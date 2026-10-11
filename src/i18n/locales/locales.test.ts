import { describe, expect, it } from 'vitest';
import adminEn from './admin.en.json';
import adminEs from './admin.es.json';
import en from './en.json';
import es from './es.json';

function keys(obj: unknown, prefix = ''): string[] {
  if (Array.isArray(obj) || obj === null || typeof obj !== 'object') return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

describe('paridad de claves i18n', () => {
  it('es.json y en.json tienen exactamente las mismas claves', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('admin.es.json y admin.en.json tienen exactamente las mismas claves', () => {
    expect(keys(adminEn).sort()).toEqual(keys(adminEs).sort());
  });

  it('ningún texto está vacío', () => {
    const values = (o: unknown): unknown[] =>
      o !== null && typeof o === 'object' ? Object.values(o).flatMap(values) : [o];
    [es, en, adminEs, adminEn].forEach((file) => values(file).forEach((v) => expect(v).not.toBe('')));
  });
});
