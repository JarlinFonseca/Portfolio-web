import type { MetaDescriptor } from 'react-router';
import { LANGS } from '@/api/public-portfolio/lang';
import type { PublicPortfolio } from '@/api/public-portfolio/schema';
import { env } from '@/config/env';
import { getI18n } from '@/lib/i18n';
import { buildPersonJsonLd } from './json-ld';

/** Título, descripción, canónica, hreflang, Open Graph, Twitter y JSON-LD de la página de un idioma. */
export function buildHomeMeta(data: PublicPortfolio): MetaDescriptor[] {
  const t = getI18n(data.lang).t;
  const site = env.SITE_URL;
  const url = `${site}/${data.lang}`;
  const title = t('meta.title');
  const description = t('meta.description');
  const image = `${site}/og-image-${data.lang}.png`;

  return [
    { title },
    { name: 'description', content: description },
    { name: 'author', content: data.profile.fullName },
    { tagName: 'link', rel: 'canonical', href: url },
    ...LANGS.map((l) => ({ tagName: 'link', rel: 'alternate', hrefLang: l, href: `${site}/${l}` })),
    { tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: `${site}/es` },
    { property: 'og:type', content: 'profile' },
    { property: 'og:site_name', content: data.profile.fullName },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:locale', content: t('meta.ogLocale') },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { 'script:ld+json': buildPersonJsonLd(data, url) },
  ];
}
