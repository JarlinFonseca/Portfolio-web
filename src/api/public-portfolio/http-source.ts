import { ContractError } from '@/lib/http/api-error';
import { httpGet } from '@/lib/http/client';
import { logger } from '@/lib/logger';
import { publicPortfolioSchema } from './schema';
import type { PortfolioSource } from './source';

export function createHttpSource({ baseUrl }: { baseUrl: string }): PortfolioSource {
  return {
    async getPortfolio(lang, { signal } = {}) {
      const data = await httpGet(`${baseUrl}/public/portfolio?lang=${lang}`, { signal, timeoutMs: 8000 });
      const parsed = publicPortfolioSchema.safeParse(data);
      if (!parsed.success) {
        const error = new ContractError('public-portfolio', parsed.error);
        logger.error(error.message, { issues: error.issues.length });
        throw error;
      }
      return parsed.data;
    },
  };
}
