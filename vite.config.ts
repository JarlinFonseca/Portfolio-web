import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';
import { parseEnv } from './src/config/env-schema';

export default defineConfig(({ mode }) => {
  // routes.ts y env.ts (en el pre-render) leen process.env: se cargan los .env sin pisar
  // lo que ya venga del entorno (CI).
  const fileEnv = loadEnv(mode, process.cwd(), '');
  for (const [key, value] of Object.entries(fileEnv)) {
    process.env[key] ??= value;
  }
  // Variables validadas con Zod antes de compilar: si una falta o es inválida, el build falla
  parseEnv(process.env, process.env, true);

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: { tsconfigPaths: true },
    server: { port: 5173 },
    preview: { port: 4173 },
  };
});
