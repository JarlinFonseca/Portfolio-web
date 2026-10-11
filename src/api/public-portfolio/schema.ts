import { z } from 'zod';
import { LANGS } from './lang';

export { isLang, LANGS, parseLang } from './lang';

/**
 * Contrato de GET /api/public/portfolio?lang={es|en}.
 * El backend lo implementa tal cual; los datos estáticos y los mocks pasan por el mismo esquema.
 */
export const langSchema = z.enum(LANGS);

export const yearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Formato YYYY-MM'); // "2024-02"

/** URL absoluta o ruta del mismo dominio (/media/...). */
export const mediaUrlSchema = z.string().regex(/^(https?:\/\/|\/)\S+$/, 'URL inválida');

export const projectTypeSchema = z.enum(['PRIVATE', 'OPEN']);

export const projectSchema = z
  .object({
    id: z.string(),
    title: z.string().min(1),
    organization: z.string().min(1),
    clientContext: z.string().nullable(),
    description: z.string().min(1),
    type: projectTypeSchema,
    repositoryUrl: z.url().nullable(),
    technologies: z.array(z.string()).min(1),
    metric: z.object({ value: z.string(), label: z.string() }).nullable(), // value no se traduce ("700+")
    featured: z.boolean(),
    cover: z.object({ url: mediaUrlSchema, alt: z.string().min(1), blurred: z.boolean() }).nullable(),
  })
  .refine((p) => p.type === 'OPEN' || p.repositoryUrl === null, {
    message: 'Un proyecto privado no puede exponer repositorio (RN-02)',
    path: ['repositoryUrl'],
  });

export const languageLevelSchema = z.enum(['NATIVE', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const certificationKindSchema = z.enum(['CERTIFICATION', 'COURSE']);

export const publicPortfolioSchema = z.object({
  lang: langSchema,
  updatedAt: z.iso.datetime(),
  profile: z.object({
    fullName: z.string().min(1),
    role: z.string().min(1),
    location: z.string(),
    intro: z.string(),
    photoUrl: mediaUrlSchema.nullable(),
    email: z.email(),
    linkedinUrl: z.url(),
    githubUrl: z.url(),
    resumeUrl: mediaUrlSchema.nullable(),
  }),
  stats: z.array(z.object({ id: z.string(), value: z.string().min(1), label: z.string().min(1) })),
  principles: z.array(z.object({ id: z.string(), title: z.string().min(1), text: z.string().min(1) })),
  projects: z.array(projectSchema),
  stack: z.object({
    cube: z.array(z.object({ technology: z.string(), category: z.string() })).length(6), // etiqueta = categoría
    categories: z.array(z.object({ id: z.string(), name: z.string(), technologies: z.array(z.string()) })),
  }),
  experience: z.array(
    z.object({
      id: z.string(),
      company: z.string(),
      role: z.string(),
      city: z.string().nullable(),
      startMonth: yearMonthSchema,
      endMonth: yearMonthSchema.nullable(),
      current: z.boolean(),
      summary: z.string(),
    }),
  ),
  education: z.array(
    z.object({
      id: z.string(),
      institution: z.string(),
      program: z.string(),
      city: z.string().nullable(),
      startMonth: yearMonthSchema.nullable(),
      endMonth: yearMonthSchema.nullable(),
    }),
  ),
  certifications: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      issuer: z.string(),
      kind: certificationKindSchema,
      issuedMonth: yearMonthSchema.nullable(),
      credentialUrl: z.url().nullable(),
    }),
  ),
  languages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      level: languageLevelSchema, // NATIVE se traduce con i18n
    }),
  ),
});

export type PublicPortfolio = z.infer<typeof publicPortfolioSchema>;
export type Project = z.infer<typeof projectSchema>;
export type ProjectType = z.infer<typeof projectTypeSchema>;
export type Lang = z.infer<typeof langSchema>;
export type Profile = PublicPortfolio['profile'];
export type Stat = PublicPortfolio['stats'][number];
export type Principle = PublicPortfolio['principles'][number];
export type Stack = PublicPortfolio['stack'];
export type Experience = PublicPortfolio['experience'][number];
export type Education = PublicPortfolio['education'][number];
export type Certification = PublicPortfolio['certifications'][number];
export type SpokenLanguage = PublicPortfolio['languages'][number];
export type LanguageLevel = z.infer<typeof languageLevelSchema>;
export type CertificationKind = z.infer<typeof certificationKindSchema>;
