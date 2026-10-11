import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const read = (file) => readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8');
const compile = (source) => new Function(`${source}\nreturn handler;`)();

/** Carga el handler de la CloudFront Function (no es un módulo ES) para ejecutarlo en Node. */
export function loadEdgeHandler() {
  return compile(read('./cloudfront-function.js'));
}

/** Carga el handler embebido en web-stack.yaml (FunctionCode) para comprobar que se comporta igual. */
export function loadTemplateHandler() {
  const lines = read('./web-stack.yaml').split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === 'FunctionCode: |');
  if (start < 0) throw new Error('No se encontró FunctionCode en web-stack.yaml');
  const indent = lines[start + 1].match(/^ */)[0].length;
  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (line.trim() && line.match(/^ */)[0].length < indent) break;
    body.push(line.slice(indent));
  }
  return compile(body.join('\n'));
}

/** Convierte un `source` de vercel.json (/es, /:path(regex)) en una expresión regular anclada. */
const sourceToRegex = (source) => new RegExp(`^${source.replace(/:\w+\(/g, '(')}$`);

/**
 * Emula el enrutamiento de Vercel con las reglas de vercel.json (redirects en orden con `has`,
 * luego archivos reales y luego rewrites) y responde con la misma forma que la CloudFront Function.
 */
export function loadVercelHandler() {
  const config = JSON.parse(readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8'));
  return (event) => {
    const { uri, cookies, headers } = event.request;
    const matchesHas = (has = []) =>
      has.every((h) => {
        const value = (h.type === 'cookie' ? cookies[h.key] : headers[h.key.toLowerCase()])?.value;
        return value !== undefined && new RegExp(h.value).test(value);
      });
    const redirect = config.redirects.find((r) => sourceToRegex(r.source).test(uri) && matchesHas(r.has));
    if (redirect) {
      return {
        statusCode: redirect.permanent ? 308 : 307,
        headers: { location: { value: redirect.destination }, 'cache-control': { value: 'no-store' } },
      };
    }
    if (/\.[a-z0-9]+$/i.test(uri)) return { uri }; // el archivo existe en build/client: Vercel lo sirve primero
    const rewrite = config.rewrites.find((r) => sourceToRegex(r.source).test(uri.replace(/\/$/, '') || '/'));
    return { uri: rewrite ? rewrite.destination : uri };
  };
}

/** Construye el evento de CloudFront a partir de una ruta, cookies y cabeceras simples. */
export function edgeEvent(uri, { cookies = {}, headers = {} } = {}) {
  const wrap = (obj) =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k.toLowerCase(), { value: v }]));
  return { request: { uri, cookies: wrap(cookies), headers: wrap(headers) } };
}
