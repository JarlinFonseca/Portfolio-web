import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/http/api-error';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // no se reintentan errores de cliente (4xx)
        retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 1,
      },
      mutations: { retry: false },
    },
  });
}
