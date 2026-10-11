import { queryOptions } from '@tanstack/react-query';
import { env } from '@/config/env';
import type { Lang } from './lang';

export const portfolioQuery = (lang: Lang) =>
  queryOptions({
    queryKey: ['public-portfolio', lang],
    // la fuente (y Zod) se cargan solo cuando hay que consultar: nunca en modo estático
    queryFn: async ({ signal }) => {
      const { createPortfolioSource } = await import('./source');
      return createPortfolioSource().getPortfolio(lang, { signal });
    },
    enabled: env.DATA_SOURCE === 'api', // en modo estático no hay nada que revalidar
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
