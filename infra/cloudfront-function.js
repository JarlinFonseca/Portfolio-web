// CloudFront Function (viewer-request) — runtime cloudfront-js-2.0
// Redirige "/" por idioma y reescribe las rutas a los archivos del bucket.
// Lo usan también `pnpm preview` (scripts/serve-build.mjs) y `pnpm test:edge`, así se prueba el mismo código.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- lo invoca CloudFront (y load-edge-function.mjs)
function handler(event) {
  var req = event.request;
  var uri = req.uri;

  // 1) "/" → idioma por cookie o por Accept-Language
  if (uri === '/' || uri === '') {
    var cookie = req.cookies && req.cookies.lang && req.cookies.lang.value;
    var accept = (req.headers['accept-language'] && req.headers['accept-language'].value) || '';
    var lang = cookie === 'en' || cookie === 'es' ? cookie : /^en/i.test(accept) ? 'en' : 'es';
    return {
      statusCode: 302,
      statusDescription: 'Found',
      headers: { location: { value: '/' + lang }, 'cache-control': { value: 'no-store' } },
    };
  }

  // 2) Páginas pre-renderizadas: /es, /es/ → /es/index.html
  if (uri === '/es' || uri === '/es/' || uri === '/en' || uri === '/en/') {
    req.uri = '/' + uri.replace(/\//g, '').slice(0, 2) + '/index.html';
    return req;
  }

  // 3) Archivos reales (tienen extensión): se sirven tal cual
  if (/\.[a-z0-9]+$/i.test(uri)) return req;

  // 4) Cualquier otra ruta (admin, 404): SPA fallback
  req.uri = '/index.html';
  return req;
}
