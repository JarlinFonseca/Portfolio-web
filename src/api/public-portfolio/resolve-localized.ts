import type { Localized, PortfolioContent } from '@/api/admin/model';
import type { Lang, PublicPortfolio } from './schema';

/** RN-01: si el texto en inglés está vacío, se usa el español. */
export function pick(value: Localized, lang: Lang): string {
  const text = lang === 'en' ? value.en.trim() : '';
  return text || value.es.trim();
}

/** La actual primero; luego de la más reciente a la más antigua por fecha de inicio. */
export function compareExperience(
  a: { current: boolean; startMonth: string; endMonth: string | null },
  b: { current: boolean; startMonth: string; endMonth: string | null },
): number {
  if (a.current !== b.current) return a.current ? -1 : 1;
  return b.startMonth.localeCompare(a.startMonth) || (b.endMonth ?? '').localeCompare(a.endMonth ?? '');
}

const orNull = (s: string) => (s.trim() ? s.trim() : null);

/**
 * Convierte el contenido bilingüe en la respuesta pública de un idioma, aplicando las mismas
 * reglas que la API: RN-01 (respaldo en español), RN-02 (privado sin repositorio),
 * RN-03 (solo lo visible), orden de experiencia por fecha y respaldo del CV.
 */
export function resolveLocalized(content: PortfolioContent, lang: Lang): PublicPortfolio {
  const { profile, highlights, stack } = content;

  const categoryOf = (tech: string) => {
    const category = stack.categories.find((c) => c.technologies.includes(tech));
    return category ? pick(category.name, lang) : '';
  };

  return {
    lang,
    updatedAt: content.updatedAt,
    profile: {
      fullName: profile.fullName,
      role: profile.role,
      location: profile.location,
      intro: pick(profile.intro, lang),
      photoUrl: profile.photoUrl,
      email: profile.email,
      linkedinUrl: `https://www.linkedin.com/in/${profile.linkedinUser}`,
      githubUrl: `https://github.com/${profile.githubUser}`,
      // RF-PUB-16: el CV del idioma activo o, si no existe, el de español
      resumeUrl: (lang === 'en' ? profile.resume.en?.url : undefined) ?? profile.resume.es?.url ?? null,
    },
    stats: highlights.stats
      .filter((s) => s.visible)
      .map((s) => ({ id: s.id, value: s.value, label: pick(s.label, lang) })),
    principles: highlights.principles.map((p) => ({
      id: p.id,
      title: pick(p.title, lang),
      text: pick(p.text, lang),
    })),
    projects: content.projects
      .filter((p) => p.visible)
      .map((p) => {
        const title = pick(p.title, lang);
        const cover = p.images.find((i) => i.id === p.coverImageId) ?? p.images[0] ?? null;
        const metricLabel = pick(p.metricLabel, lang);
        return {
          id: p.id,
          title,
          organization: p.organization,
          clientContext: orNull(pick(p.clientContext, lang)),
          description: pick(p.description, lang),
          type: p.type,
          repositoryUrl: p.type === 'OPEN' ? orNull(p.repositoryUrl ?? '') : null,
          technologies: p.technologies,
          metric: p.metricValue.trim() ? { value: p.metricValue.trim(), label: metricLabel } : null,
          featured: p.featured,
          cover: cover ? { url: cover.url, alt: cover.alt.trim() || title, blurred: p.blurImages } : null,
        };
      }),
    stack: {
      cube: stack.cube.map((technology) => ({
        technology: technology ?? '',
        category: technology ? categoryOf(technology) : '',
      })),
      categories: stack.categories.map((c) => ({
        id: c.id,
        name: pick(c.name, lang),
        technologies: c.technologies,
      })),
    },
    experience: [...content.experience].sort(compareExperience).map((e) => ({
      id: e.id,
      company: e.company,
      role: pick(e.role, lang),
      city: orNull(e.city),
      startMonth: e.startMonth,
      endMonth: e.current ? null : e.endMonth,
      current: e.current,
      summary: pick(e.summary, lang),
    })),
    education: content.education
      .filter((e) => e.visible)
      .map((e) => ({
        id: e.id,
        institution: e.institution,
        program: pick(e.program, lang),
        city: orNull(e.city),
        startMonth: e.startMonth,
        endMonth: e.endMonth,
      })),
    certifications: content.certifications
      .filter((c) => c.visible)
      .map((c) => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        kind: c.kind,
        issuedMonth: c.issuedMonth,
        credentialUrl: orNull(c.credentialUrl ?? ''),
      })),
    languages: content.languages.map((l) => ({ id: l.id, name: pick(l.name, lang), level: l.level })),
  };
}
