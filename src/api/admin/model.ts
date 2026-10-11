import { z } from 'zod';
import {
  certificationKindSchema,
  languageLevelSchema,
  mediaUrlSchema,
  projectTypeSchema,
  yearMonthSchema,
} from '@/api/public-portfolio/schema';

/**
 * Modelo bilingüe del contenido (equivale a las columnas *_es / *_en del backend).
 * Lo usan el seed estático, los mocks de MSW y las pantallas del admin.
 */
export const localizedSchema = z.object({ es: z.string(), en: z.string() });
export type Localized = z.infer<typeof localizedSchema>;

export const projectImageSchema = z.object({ id: z.string(), url: mediaUrlSchema, alt: z.string() });

export const adminProjectSchema = z.object({
  id: z.string(),
  title: localizedSchema,
  organization: z.string(),
  clientContext: localizedSchema,
  description: localizedSchema,
  type: projectTypeSchema,
  repositoryUrl: z.string().nullable(),
  technologies: z.array(z.string()),
  metricValue: z.string(),
  metricLabel: localizedSchema,
  featured: z.boolean(),
  visible: z.boolean(),
  blurImages: z.boolean(),
  images: z.array(projectImageSchema),
  coverImageId: z.string().nullable(),
  version: z.number().int(),
});

export const adminExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  city: z.string(),
  role: localizedSchema,
  startMonth: yearMonthSchema,
  endMonth: yearMonthSchema.nullable(),
  current: z.boolean(),
  summary: localizedSchema,
});

export const adminEducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  city: z.string(),
  program: localizedSchema,
  startMonth: yearMonthSchema.nullable(),
  endMonth: yearMonthSchema.nullable(),
  visible: z.boolean(),
});

export const adminCertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  kind: certificationKindSchema,
  issuedMonth: yearMonthSchema.nullable(),
  credentialUrl: z.string().nullable(),
  visible: z.boolean(),
});

export const adminLanguageSchema = z.object({
  id: z.string(),
  name: localizedSchema,
  level: languageLevelSchema,
});

export const adminStackSchema = z.object({
  categories: z.array(z.object({ id: z.string(), name: localizedSchema, technologies: z.array(z.string()) })),
  /** Las 6 caras del cubo, por nombre de tecnología (null = cara sin elegir). */
  cube: z.array(z.string().nullable()).length(6),
});

export const adminHighlightsSchema = z.object({
  stats: z.array(
    z.object({ id: z.string(), value: z.string(), label: localizedSchema, visible: z.boolean() }),
  ),
  principles: z.array(z.object({ id: z.string(), title: localizedSchema, text: localizedSchema })),
});

export const resumeFileSchema = z.object({ fileName: z.string(), url: mediaUrlSchema }).nullable();

export const adminProfileSchema = z.object({
  fullName: z.string(),
  role: z.string(),
  location: z.string(),
  intro: localizedSchema,
  photoUrl: mediaUrlSchema.nullable(),
  email: z.string(),
  linkedinUser: z.string(),
  githubUser: z.string(),
  resume: z.object({ es: resumeFileSchema, en: resumeFileSchema }),
});

export const portfolioContentSchema = z.object({
  updatedAt: z.iso.datetime(),
  profile: adminProfileSchema,
  highlights: adminHighlightsSchema,
  projects: z.array(adminProjectSchema),
  stack: adminStackSchema,
  experience: z.array(adminExperienceSchema),
  education: z.array(adminEducationSchema),
  certifications: z.array(adminCertificationSchema),
  languages: z.array(adminLanguageSchema),
});

export type AdminProject = z.infer<typeof adminProjectSchema>;
export type ProjectImage = z.infer<typeof projectImageSchema>;
export type AdminExperience = z.infer<typeof adminExperienceSchema>;
export type AdminEducation = z.infer<typeof adminEducationSchema>;
export type AdminCertification = z.infer<typeof adminCertificationSchema>;
export type AdminLanguage = z.infer<typeof adminLanguageSchema>;
export type AdminStack = z.infer<typeof adminStackSchema>;
export type AdminHighlights = z.infer<typeof adminHighlightsSchema>;
export type AdminProfile = z.infer<typeof adminProfileSchema>;
export type ResumeFile = z.infer<typeof resumeFileSchema>;
export type PortfolioContent = z.infer<typeof portfolioContentSchema>;

export type CareerKind = 'experience' | 'education' | 'certifications' | 'languages';

export interface SessionUser {
  email: string;
}
