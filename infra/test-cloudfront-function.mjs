// Casos de la CloudFront Function (FE-026). Uso: pnpm test:edge
// Se prueban el archivo fuente, la copia embebida en la plantilla CloudFormation y las reglas de vercel.json,
// para que los tres despliegues (AWS manual, AWS con CloudFormation y Vercel) se comporten igual.
import assert from 'node:assert/strict';
import { edgeEvent, loadEdgeHandler, loadTemplateHandler, loadVercelHandler } from './load-edge-function.mjs';

const handlers = {
  'infra/cloudfront-function.js': loadEdgeHandler(),
  'infra/web-stack.yaml (FunctionCode)': loadTemplateHandler(),
  'vercel.json': loadVercelHandler(),
};

const cases = [
  ['/ sin preferencia → /es', (run) => assert.equal(run('/').headers.location.value, '/es')],
  [
    '/ con Accept-Language en → /en',
    (run) =>
      assert.equal(
        run('/', { headers: { 'accept-language': 'en-US,en;q=0.9' } }).headers.location.value,
        '/en',
      ),
  ],
  [
    '/ con navegador en español e inglés secundario → /es',
    (run) =>
      assert.equal(
        run('/', { headers: { 'accept-language': 'es-CO,es;q=0.9,en;q=0.8' } }).headers.location.value,
        '/es',
      ),
  ],
  [
    '/ con cookie lang=en → /en',
    (run) => assert.equal(run('/', { cookies: { lang: 'en' } }).headers.location.value, '/en'),
  ],
  [
    '/ con cookie lang=es gana a Accept-Language',
    (run) =>
      assert.equal(
        run('/', { cookies: { lang: 'es' }, headers: { 'accept-language': 'en' } }).headers.location.value,
        '/es',
      ),
  ],
  [
    '/ redirige de forma temporal (302/307), nunca permanente',
    (run) => {
      const res = run('/');
      assert.ok([302, 307].includes(res.statusCode), `código ${res.statusCode}`);
      assert.equal(res.headers['cache-control'].value, 'no-store');
    },
  ],
  ['/es → /es/index.html', (run) => assert.equal(run('/es').uri, '/es/index.html')],
  ['/en/ → /en/index.html', (run) => assert.equal(run('/en/').uri, '/en/index.html')],
  ['/en.data se sirve tal cual', (run) => assert.equal(run('/en.data').uri, '/en.data')],
  ['/assets/x.js se sirve tal cual', (run) => assert.equal(run('/assets/x.js').uri, '/assets/x.js')],
  ['/admin/projects → SPA fallback', (run) => assert.equal(run('/admin/projects').uri, '/index.html')],
  ['/fr → SPA fallback (la app muestra 404)', (run) => assert.equal(run('/fr').uri, '/index.html')],
];

let failed = 0;
let total = 0;
for (const [source, handler] of Object.entries(handlers)) {
  console.log(`\n${source}`);
  const run = (uri, opts) => handler(edgeEvent(uri, opts));
  for (const [name, fn] of cases) {
    total++;
    try {
      fn(run);
      console.log(`  ✓ ${name}`);
    } catch (error) {
      failed++;
      console.error(`  ✗ ${name}\n    ${error.message}`);
    }
  }
}
console.log(`\n${total - failed}/${total} casos correctos`);
process.exit(failed ? 1 : 0);
