import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminStack } from '@/api/admin/model';
import { adminApi } from '@/lib/http/admin-api';

export const stackKey = ['admin', 'stack'] as const;

export const stackQuery = queryOptions({
  queryKey: stackKey,
  queryFn: ({ signal }) => adminApi.get<AdminStack>('/admin/stack', signal),
});

export const useStack = () => useQuery(stackQuery);

/** Un solo «Guardar cambios»: PUT /api/admin/stack con categorías, orden y caras del cubo. */
export function useSaveStack() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stack: AdminStack) => adminApi.put<AdminStack>('/admin/stack', stack),
    onSuccess: (data) => queryClient.setQueryData(stackKey, data),
  });
}
