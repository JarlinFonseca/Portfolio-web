import { z } from 'zod';
import type {
  AdminCertification,
  AdminEducation,
  AdminExperience,
  AdminLanguage,
  CareerKind,
} from '@/api/admin/model';
import { languageLevelSchema } from '@/api/public-portfolio/schema';

/** Los mensajes son claves de i18n del espacio "admin". */
const REQUIRED = 'common.required';
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;
const localized = z.object({ es: z.string(), en: z.string() });
const requiredEs = localized.refine((l) => l.es.trim().length > 0, { message: REQUIRED, path: ['es'] });
const month = z.string().refine((v) => MONTH.test(v), 'career.errorMonth');
const optionalMonth = z.string().refine((v) => v === '' || MONTH.test(v), 'career.errorMonth');

/** RF-TRA-09: la fecha de fin no puede ser anterior a la de inicio. */
const endAfterStart = (start: string, end: string) => !start || !end || end >= start;

export const experienceFormSchema = z
  .object({
    company: z.string().trim().min(1, REQUIRED),
    city: z.string(),
    role: requiredEs,
    startMonth: month,
    endMonth: optionalMonth,
    current: z.boolean(),
    summary: requiredEs,
  })
  .superRefine((v, ctx) => {
    if (!v.current && !v.endMonth)
      ctx.addIssue({ code: 'custom', path: ['endMonth'], message: 'career.errorEndRequired' });
    if (!v.current && !endAfterStart(v.startMonth, v.endMonth))
      ctx.addIssue({ code: 'custom', path: ['endMonth'], message: 'career.errorEndBeforeStart' });
  });

export const educationFormSchema = z
  .object({
    institution: z.string().trim().min(1, REQUIRED),
    city: z.string(),
    program: requiredEs,
    startMonth: optionalMonth,
    endMonth: optionalMonth,
    visible: z.boolean(),
  })
  .refine((v) => endAfterStart(v.startMonth, v.endMonth), {
    path: ['endMonth'],
    message: 'career.errorEndBeforeStart',
  });

export const certificationFormSchema = z.object({
  name: z.string().trim().min(1, REQUIRED),
  issuer: z.string().trim().min(1, REQUIRED),
  kind: z.enum(['CERTIFICATION', 'COURSE']),
  issuedMonth: optionalMonth,
  credentialUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || z.url({ protocol: /^https?$/ }).safeParse(v).success, 'common.invalidUrl'),
  visible: z.boolean(),
});

export const languageFormSchema = z.object({
  name: requiredEs,
  level: languageLevelSchema,
});

export type ExperienceForm = z.infer<typeof experienceFormSchema>;
export type EducationForm = z.infer<typeof educationFormSchema>;
export type CertificationForm = z.infer<typeof certificationFormSchema>;
export type LanguageForm = z.infer<typeof languageFormSchema>;

export const careerFormSchemas = {
  experience: experienceFormSchema,
  education: educationFormSchema,
  certifications: certificationFormSchema,
  languages: languageFormSchema,
} as const;

const L = () => ({ es: '', en: '' });

export const emptyForms = {
  experience: (): ExperienceForm => ({
    company: '',
    city: '',
    role: L(),
    startMonth: '',
    endMonth: '',
    current: false,
    summary: L(),
  }),
  education: (): EducationForm => ({
    institution: '',
    city: '',
    program: L(),
    startMonth: '',
    endMonth: '',
    visible: true,
  }),
  certifications: (): CertificationForm => ({
    name: '',
    issuer: '',
    kind: 'CERTIFICATION',
    issuedMonth: '',
    credentialUrl: '',
    visible: true,
  }),
  languages: (): LanguageForm => ({ name: L(), level: 'B1' }),
} satisfies Record<CareerKind, () => unknown>;

const nullable = (v: string) => (v.trim() ? v.trim() : null);

export const toForm = {
  experience: (i: AdminExperience): ExperienceForm => ({ ...i, endMonth: i.endMonth ?? '' }),
  education: (i: AdminEducation): EducationForm => ({
    ...i,
    startMonth: i.startMonth ?? '',
    endMonth: i.endMonth ?? '',
  }),
  certifications: (i: AdminCertification): CertificationForm => ({
    ...i,
    issuedMonth: i.issuedMonth ?? '',
    credentialUrl: i.credentialUrl ?? '',
  }),
  languages: (i: AdminLanguage): LanguageForm => ({ name: i.name, level: i.level }),
};

export const fromForm = {
  experience: (f: ExperienceForm): Omit<AdminExperience, 'id'> => ({
    ...f,
    company: f.company.trim(),
    endMonth: f.current ? null : nullable(f.endMonth), // RF-TRA-05
  }),
  education: (f: EducationForm): Omit<AdminEducation, 'id'> => ({
    ...f,
    institution: f.institution.trim(),
    startMonth: nullable(f.startMonth),
    endMonth: nullable(f.endMonth),
  }),
  certifications: (f: CertificationForm): Omit<AdminCertification, 'id'> => ({
    ...f,
    issuedMonth: nullable(f.issuedMonth),
    credentialUrl: nullable(f.credentialUrl),
  }),
  languages: (f: LanguageForm): Omit<AdminLanguage, 'id'> => f,
};
