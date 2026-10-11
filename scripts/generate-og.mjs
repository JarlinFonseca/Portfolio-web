// Genera public/og-image-{es,en}.png (1200×630) con la identidad del diseño. Uso: node scripts/generate-og.mjs
import { chromium } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const font = (p) => pathToFileURL(resolve('node_modules', p)).href;
const FONTS = `
@font-face{font-family:Bricolage;src:url(${font('@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2')});font-weight:200 800}
@font-face{font-family:Serif;font-style:italic;src:url(${font('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff2')})}
@font-face{font-family:Mono;src:url(${font('@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2')})}`;

const COPY = {
  es: {
    kicker: 'Backend Developer · DevSecOps',
    a: 'Construyo el backend',
    b: 'que no se ve,',
    c: 'pero sostiene todo.',
  },
  en: {
    kicker: 'Backend Developer · DevSecOps',
    a: 'I build the backend',
    b: 'you never see,',
    c: 'but everything runs on.',
  },
};

const html = (c) => `<!doctype html><html><head><style>${FONTS}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;font-family:Bricolage,sans-serif;color:#14161A;background:#EFF0EC;background-image:radial-gradient(#d3d5cd 1.2px,transparent 1.2px);background-size:28px 28px;padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.top{display:flex;align-items:center;gap:16px}
.mark{width:64px;height:64px;border-radius:18px;background:#14161A;color:#EFF0EC;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:26px}
.name{font-size:30px;font-weight:700;letter-spacing:-.01em}
.pill{margin-top:6px;display:inline-flex;align-items:center;gap:10px;padding:8px 16px;border:1.5px solid #14161A;border-radius:999px;background:#FAFAF7;font-family:Mono,monospace;font-size:19px}
.dot{width:10px;height:10px;border-radius:50%;background:#2F7D5B}
h1{font-size:80px;line-height:.98;letter-spacing:-.035em;font-weight:700;max-width:760px}
em{font-family:Serif,serif;font-weight:400;color:#2D5BE3;letter-spacing:-.01em}
.foot{font-family:Mono,monospace;font-size:20px;color:#4A4F59}
svg{position:absolute;right:60px;top:200px}
</style></head><body>
<div class="top"><div class="mark">JF</div><div><div class="name">Jarlin Andrés Fonseca</div><div class="pill"><span class="dot"></span>${c.kicker}</div></div></div>
<h1>${c.a} <em>${c.b}</em> ${c.c}</h1>
<div class="foot">Java · Spring Boot · NestJS · AWS · CI/CD</div>
<svg width="220" height="250" viewBox="0 0 170 190"><polygon points="85,5 165,50 85,95 5,50" fill="#5278e8" stroke="#14161a" stroke-width="1.5"/><polygon points="5,50 85,95 85,185 5,140" fill="#2346b1" stroke="#14161a" stroke-width="1.5"/><polygon points="165,50 85,95 85,185 165,140" fill="#1a3690" stroke="#14161a" stroke-width="1.5"/></svg>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// se sirve como archivo para que el navegador pueda leer las fuentes locales (file://)
const dir = mkdtempSync(resolve(tmpdir(), 'og-'));
for (const lang of ['es', 'en']) {
  const file = resolve(dir, `og-${lang}.html`);
  writeFileSync(file, html(COPY[lang]));
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => globalThis.document.fonts.ready);
  await page.screenshot({ path: `public/og-image-${lang}.png` });
  console.log(`public/og-image-${lang}.png`);
}
await browser.close();
rmSync(dir, { recursive: true, force: true });
