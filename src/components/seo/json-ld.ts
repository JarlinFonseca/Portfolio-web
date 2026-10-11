import type { PublicPortfolio } from '@/api/public-portfolio/schema';

/** Datos estructurados schema.org/Person. */
export function buildPersonJsonLd(data: PublicPortfolio, url: string) {
  const { profile } = data;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.fullName,
    jobTitle: profile.role,
    description: profile.intro,
    url,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: profile.location },
    sameAs: [profile.linkedinUrl, profile.githubUrl],
    knowsAbout: data.stack.categories.flatMap((c) => c.technologies).slice(0, 20),
    ...(profile.photoUrl ? { image: profile.photoUrl } : {}),
  };
}
