import { z } from 'zod';

/**
 * Esquema de las variables de entorno. Se valida en Node al arrancar Vite y en el build
 * (vite.config.ts): si falta una o es inválida, el build falla. El navegador lee los valores
 * ya validados desde env.ts, sin cargar Zod.
 */

const bool = z
  .enum(['true', 'false'])
  .default('false')
  .transform((v) => v === 'true');

export const envSchema = z
  .object({
    DATA_SOURCE: z.enum(['static', 'api']).default('static'),
    API_BASE_URL: z.string().min(1).default('/api'),
    API_BUILD_URL: z.url().optional(),
    SITE_URL: z.url().transform((u) => u.replace(/\/$/, '')),
    ENABLE_ADMIN: bool,
    ENABLE_MSW: bool,
    ENABLE_WEBGL_HERO: bool,
    IS_SERVER: z.boolean(),
  })
  .refine((e) => !e.IS_SERVER || e.DATA_SOURCE !== 'api' || !!e.API_BUILD_URL, {
    message: 'API_BUILD_URL es obligatoria en modo api durante el build',
    path: ['API_BUILD_URL'],
  });

export type Env = z.infer<typeof envSchema>;

type RawEnv = Record<string, string | boolean | undefined>;

export function parseEnv(raw: RawEnv, serverRaw: RawEnv = {}, isServer = false): Env {
  const val = (v: string | boolean | undefined) => (v === '' || typeof v === 'boolean' ? undefined : v);
  const result = envSchema.safeParse({
    DATA_SOURCE: val(raw.VITE_DATA_SOURCE),
    API_BASE_URL: val(raw.VITE_API_BASE_URL),
    API_BUILD_URL: val(serverRaw.API_BUILD_URL),
    SITE_URL: val(raw.VITE_SITE_URL),
    ENABLE_ADMIN: val(raw.VITE_ENABLE_ADMIN),
    ENABLE_MSW: val(raw.VITE_ENABLE_MSW),
    ENABLE_WEBGL_HERO: val(raw.VITE_ENABLE_WEBGL_HERO),
    IS_SERVER: isServer,
  });
  if (!result.success) {
    throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
