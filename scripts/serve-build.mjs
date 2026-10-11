// Sirve build/client como lo haría CloudFront + S3, usando la misma CloudFront Function.
// Uso: pnpm preview [--port 4173]
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { edgeEvent, loadEdgeHandler } from '../infra/load-edge-function.mjs';

const root = fileURLToPath(new URL('../build/client', import.meta.url));
const portArg = process.argv.indexOf('--port');
const port = Number(portArg > -1 ? process.argv[portArg + 1] : (process.env.PORT ?? 4173));
const handler = loadEdgeHandler();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.data': 'text/x-script',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
};

if (!existsSync(root)) {
  console.error('No existe build/client: ejecuta primero `pnpm build`.');
  process.exit(1);
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const cookies = Object.fromEntries(
    (req.headers.cookie ?? '')
      .split(/;\s*/)
      .filter(Boolean)
      .map((c) => c.split('=')),
  );
  const result = handler(
    edgeEvent(decodeURIComponent(url.pathname), {
      cookies,
      headers: { 'accept-language': req.headers['accept-language'] ?? '' },
    }),
  );

  if (result.statusCode) {
    const headers = Object.fromEntries(Object.entries(result.headers).map(([k, v]) => [k, v.value]));
    res.writeHead(result.statusCode, headers).end();
    return;
  }

  const file = join(root, normalize(result.uri));
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    // Respuesta de error personalizada de CloudFront: 404 → /index.html con código 404
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    createReadStream(join(root, 'index.html')).pipe(res);
    return;
  }
  const immutable = result.uri.startsWith('/assets/');
  res.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate',
    'x-content-type-options': 'nosniff',
  });
  createReadStream(file).pipe(res);
}).listen(port, () => console.log(`Build servido como CloudFront en http://localhost:${port}`));
