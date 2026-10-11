import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src/app',
  ssr: false, // sin servidor Node: todo es estático en S3
  prerender: ['/es', '/en'], // HTML completo por idioma; "/" NO se pre-renderiza (queda como SPA fallback)
} satisfies Config;
