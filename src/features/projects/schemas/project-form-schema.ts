import { z } from 'zod';
import type { AdminProject } from '@/api/admin/model';
import type { Lang, Project } from '@/api/public-portfolio/schema';
import type { ProjectInput } from '../api/admin-projects';

const localized = z.object({ es: z.string(), en: z.string() });

/**
 * Reglas del formulario (RF-PRO-21): título y descripción en español, organización, tipo y al menos
 * una tecnología. En abiertos, el enlace debe ser una URL; en privados se limpia (RN-02).
 * Los mensajes son claves de i18n del espacio "admin".
 */
export const projectFormSchema = z
  .object({
    title: localized,
    organization: z.string(),
    clientContext: localized,
    description: localized,
    type: z.enum(['PRIVATE', 'OPEN']),
    repositoryUrl: z.string(),
    technologies: z.array(z.string()),
    metricValue: z.string(),
    metricLabel: localized,
    featured: z.boolean(),
    visible: z.boolean(),
    blurImages: z.boolean(),
    order: z.number().int().min(1),
  })
  .superRefine((v, ctx) => {
    if (!v.title.es.trim())
      ctx.addIssue({ code: 'custom', path: ['title', 'es'], message: 'projectForm.errorTitleEs' });
    if (!v.description.es.trim())
      ctx.addIssue({
        code: 'custom',
        path: ['description', 'es'],
        message: 'projectForm.errorDescriptionEs',
      });
    if (!v.organization.trim())
      ctx.addIssue({ code: 'custom', path: ['organization'], message: 'projectForm.errorOrganization' });
    if (v.technologies.length === 0)
      ctx.addIssue({ code: 'custom', path: ['technologies'], message: 'projectForm.errorTechnologies' });
    if (
      v.type === 'OPEN' &&
      v.repositoryUrl.trim() &&
      !z.url({ protocol: /^https?$/ }).safeParse(v.repositoryUrl.trim()).success
    )
      ctx.addIssue({ code: 'custom', path: ['repositoryUrl'], message: 'common.invalidUrl' });
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

const emptyL = () => ({ es: '', en: '' });

export function toFormValues(project: AdminProject | undefined, order: number): ProjectFormValues {
  if (!project) {
    return {
      title: emptyL(),
      organization: '',
      clientContext: emptyL(),
      description: emptyL(),
      type: 'PRIVATE',
      repositoryUrl: '',
      technologies: [],
      metricValue: '',
      metricLabel: emptyL(),
      featured: false,
      visible: true,
      blurImages: true, // RF-PRO-18: activado por defecto en privados
      order,
    };
  }
  return {
    title: project.title,
    organization: project.organization,
    clientContext: project.clientContext,
    description: project.description,
    type: project.type,
    repositoryUrl: project.repositoryUrl ?? '',
    technologies: project.technologies,
    metricValue: project.metricValue,
    metricLabel: project.metricLabel,
    featured: project.featured,
    visible: project.visible,
    blurImages: project.blurImages,
    order,
  };
}

const trimL = (l: { es: string; en: string }) => ({ es: l.es.trim(), en: l.en.trim() });

export function toProjectInput(v: ProjectFormValues, version?: number): ProjectInput {
  return {
    title: trimL(v.title),
    organization: v.organization.trim(),
    clientContext: trimL(v.clientContext),
    description: trimL(v.description),
    type: v.type,
    repositoryUrl: v.type === 'OPEN' && v.repositoryUrl.trim() ? v.repositoryUrl.trim() : null,
    technologies: v.technologies,
    metricValue: v.metricValue.trim(),
    metricLabel: trimL(v.metricLabel),
    featured: v.featured,
    visible: v.visible,
    blurImages: v.blurImages,
    ...(version !== undefined ? { version } : {}),
  };
}

/** Datos de la vista previa en vivo con la misma forma que la tarjeta pública (RN-01 incluido). */
export function toPreviewProject(
  v: ProjectFormValues,
  lang: Lang,
  cover: { url: string; alt: string } | null,
  placeholderTitle: string,
): Project {
  const pick = (l: { es: string; en: string }) => (lang === 'en' && l.en.trim() ? l.en : l.es).trim();
  const title = pick(v.title) || placeholderTitle;
  const description = pick(v.description);
  return {
    id: 'preview',
    title,
    organization: v.organization.trim() || '—',
    clientContext: pick(v.clientContext) || null,
    description: description.length > 110 ? `${description.slice(0, 110).trimEnd()}…` : description || '—',
    type: v.type,
    repositoryUrl: v.type === 'OPEN' && v.repositoryUrl.trim() ? v.repositoryUrl.trim() : null,
    technologies: v.technologies.length ? v.technologies : ['—'],
    metric: v.metricValue.trim() ? { value: v.metricValue.trim(), label: pick(v.metricLabel) } : null,
    featured: v.featured,
    cover: cover ? { url: cover.url, alt: cover.alt || title, blurred: v.blurImages } : null,
  };
}
