// Tareas posteriores al build: sitemap.xml con hreflang (FE-021) y verificación de las páginas pre-renderizadas.
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const root = fileURLToPath(new URL('../build/client', import.meta.url));
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
const site = (env.VITE_SITE_URL ?? '').replace(/\/$/, '');

if (!site) {
  console.error('postbuild: falta VITE_SITE_URL');
  process.exit(1);
}

for (const lang of ['es', 'en']) {
  const html = `${root}/${lang}/index.html`;
  if (!existsSync(html)) {
    console.error(`postbuild: no se pre-renderizó /${lang}`);
    process.exit(1);
  }
  if (!readFileSync(html, 'utf8').includes(`<html lang="${lang}"`)) {
    console.error(`postbuild: /${lang} no tiene <html lang="${lang}">`);
    process.exit(1);
  }
}

// MSW solo se usa en desarrollo: su service worker no se publica
if (env.VITE_ENABLE_MSW !== 'true') rmSync(`${root}/mockServiceWorker.js`, { force: true });

const lastmod = new Date().toISOString().slice(0, 10);
const alternates = ['es', 'en']
  .map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${site}/${l}"/>`)
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${site}/es"/>`)
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${['es', 'en']
  .map(
    (l) => `  <url>\n    <loc>${site}/${l}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`,
  )
  .join('\n')}
</urlset>
`;
writeFileSync(`${root}/sitemap.xml`, sitemap);

const robots = `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site}/sitemap.xml\n`;
writeFileSync(`${root}/robots.txt`, robots);

console.log(`postbuild: sitemap.xml y robots.txt generados para ${site}`);
