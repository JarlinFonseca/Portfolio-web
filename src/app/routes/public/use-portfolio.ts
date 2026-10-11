import { useQuery } from '@tanstack/react-query';
import { useRouteLoaderData } from 'react-router';
import { portfolioQuery } from '@/api/public-portfolio/query';
import type { Lang, PublicPortfolio } from '@/api/public-portfolio/schema';

export const HOME_ROUTE_ID = 'routes/public/home';

/**
 * Datos públicos: los pre-renderizados en el build como initialData y, en modo API,
 * revalidados en segundo plano. Si la revalidación falla se conservan los anteriores.
 */
export function usePortfolio(lang: Lang): PublicPortfolio | undefined {
  const loaderData = useRouteLoaderData<PublicPortfolio>(HOME_ROUTE_ID);
  const initial = loaderData?.lang === lang ? loaderData : undefined;
  const { data } = useQuery({
    ...portfolioQuery(lang),
    ...(initial ? { initialData: initial } : {}),
    initialDataUpdatedAt: 0, // datos del build tratados como viejos: en modo API revalida al montar
  });
  return data ?? initial;
}
