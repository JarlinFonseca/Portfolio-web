import { describe, expect, it } from 'vitest';
import { cn } from './cn';
import { formatMonth, formatRange, yearOf } from './format-month';
import { maskEmail } from './mask-email';

describe('formatMonth', () => {
  it('formatea por idioma con mayúscula inicial', () => {
    expect(formatMonth('2024-02', 'es')).toBe('Feb 2024');
    expect(formatMonth('2023-01', 'es')).toBe('Ene 2023');
    expect(formatMonth('2023-01', 'en')).toBe('Jan 2023');
    expect(formatMonth('2023-09', 'es')).toBe('Sep 2023');
  });
});

describe('formatRange', () => {
  it('actual → "hoy" / "now"', () => {
    expect(formatRange('2024-02', null, 'es', true)).toBe('Feb 2024 — hoy');
    expect(formatRange('2024-02', null, 'en', true)).toBe('Feb 2024 — now');
  });
  it('mismo año compacta el primer mes', () =>
    expect(formatRange('2023-03', '2023-09', 'es')).toBe('Mar — Sep 2023'));
  it('años distintos', () => expect(formatRange('2018-02', '2023-11', 'en')).toBe('Feb 2018 — Nov 2023'));
  it('mismo mes', () => expect(formatRange('2023-03', '2023-03', 'es')).toBe('Mar 2023'));
  it('sin inicio', () => {
    expect(formatRange(null, '2020-01', 'es')).toBe('Ene 2020');
    expect(formatRange(null, null, 'es')).toBe('');
  });
});

describe('utilidades', () => {
  it('yearOf', () => {
    expect(yearOf('2021-12')).toBe('2021');
    expect(yearOf(null)).toBe('');
  });
  it('maskEmail', () => {
    expect(maskEmail('jarlin@gmail.com')).toBe('ja****@gmail.com');
    expect(maskEmail('a@b.co')).toBe('a*@b.co');
    expect(maskEmail('sin-arroba')).toBe('sin-arroba');
  });
  it('cn ignora valores falsos', () => expect(cn('a', false, null, undefined, 'b')).toBe('a b'));
});
