import { env } from '@/config/env';
import { createHttpSource } from './http-source';
import type { Lang, PublicPortfolio } from './schema';
import { createStaticSource } from './static-source';

export interface PortfolioSource {
  getPortfolio(lang: Lang, options?: { signal?: AbortSignal | undefined }): Promise<PublicPortfolio>;
}

export function createPortfolioSource(): PortfolioSource {
  if (env.DATA_SOURCE === 'api') {
    // en el build (Node) no hay dominio relativo: se usa la URL absoluta
    const baseUrl =
      typeof window === 'undefined' ? (env.API_BUILD_URL ?? env.API_BASE_URL) : env.API_BASE_URL;
    return createHttpSource({ baseUrl });
  }
  return createStaticSource();
}
