import { describe, expect, it } from 'vitest';
import {
  certificationFormSchema,
  educationFormSchema,
  emptyForms,
  experienceFormSchema,
  fromForm,
} from './schemas';

const messages = (r: { error?: { issues: { path: PropertyKey[]; message: string }[] } }) =>
  r.error?.issues.map((i) => `${i.path.join('.')}:${i.message}`) ?? [];

describe('formularios de trayectoria', () => {
  const job = {
    ...emptyForms.experience(),
    company: 'Pragma',
    role: { es: 'Backend', en: '' },
    summary: { es: 'x', en: '' },
  };

  it('RF-TRA-09: la fecha de fin no puede ser anterior a la de inicio', () => {
    const r = experienceFormSchema.safeParse({ ...job, startMonth: '2023-09', endMonth: '2023-03' });
    expect(messages(r)).toEqual(['endMonth:career.errorEndBeforeStart']);
  });

  it('sin «Trabajo aquí actualmente» se exige fecha de fin', () => {
    const r = experienceFormSchema.safeParse({ ...job, startMonth: '2023-03', endMonth: '' });
    expect(messages(r)).toEqual(['endMonth:career.errorEndRequired']);
  });

  it('RF-TRA-05: con «actual» se ignora la fecha de fin al guardar', () => {
    const values = { ...job, startMonth: '2024-02', endMonth: '2024-05', current: true };
    expect(experienceFormSchema.safeParse(values).success).toBe(true);
    expect(fromForm.experience(values).endMonth).toBeNull();
  });

  it('formación: campos obligatorios y fechas opcionales', () => {
    const r = educationFormSchema.safeParse(emptyForms.education());
    expect(messages(r)).toEqual(['institution:common.required', 'program.es:common.required']);
  });

  it('certificación: la URL de credencial debe ser válida si se escribe', () => {
    const base = { ...emptyForms.certifications(), name: 'CCNA', issuer: 'Cisco' };
    expect(certificationFormSchema.safeParse(base).success).toBe(true);
    expect(messages(certificationFormSchema.safeParse({ ...base, credentialUrl: 'abc' }))).toEqual([
      'credentialUrl:common.invalidUrl',
    ]);
    expect(fromForm.certifications(base).credentialUrl).toBeNull();
  });
});
