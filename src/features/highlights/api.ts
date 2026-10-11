import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminHighlights } from '@/api/admin/model';
import { adminApi } from '@/lib/http/admin-api';

export const highlightsKey = ['admin', 'highlights'] as const;

export const highlightsQuery = queryOptions({
  queryKey: highlightsKey,
  queryFn: ({ signal }) => adminApi.get<AdminHighlights>('/admin/highlights', signal),
});

export const useHighlights = () => useQuery(highlightsQuery);

/** PUT /api/admin/highlights con cifras y principios en su orden, en una sola operación. */
export function useSaveHighlights() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminHighlights) => adminApi.put<AdminHighlights>('/admin/highlights', data),
    onSuccess: (data) => queryClient.setQueryData(highlightsKey, data),
  });
}

/** RF-CIF-07: valor y texto en español en cada cifra; título y texto en español en cada principio. */
export function highlightsErrors(data: AdminHighlights) {
  return {
    stats: new Set(data.stats.filter((s) => !s.value.trim() || !s.label.es.trim()).map((s) => s.id)),
    principles: new Set(
      data.principles.filter((p) => !p.title.es.trim() || !p.text.es.trim()).map((p) => p.id),
    ),
  };
}
