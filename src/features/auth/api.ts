import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SessionUser } from '@/api/admin/model';
import { ApiError } from '@/lib/http/api-error';
import { adminUrl } from '@/lib/http/admin-api';
import { request } from '@/lib/http/client';

/** GET /api/auth/me: el usuario de la sesión o null (la cookie httpOnly nunca se lee desde JS). */
export const sessionQuery = queryOptions({
  queryKey: ['auth', 'me'],
  queryFn: async ({ signal }): Promise<SessionUser | null> => {
    try {
      return await request<SessionUser>('GET', adminUrl('/auth/me'), { signal });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  staleTime: 5 * 60_000,
  retry: false,
});

export function useSession() {
  return useQuery(sessionQuery);
}

export interface LoginInput {
  email: string;
  password: string;
  remember: boolean;
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => request<SessionUser>('POST', adminUrl('/auth/login'), { body: input }),
    onSuccess: (user) => queryClient.setQueryData(sessionQuery.queryKey, user),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => request<void>('POST', adminUrl('/auth/logout')),
    onSettled: () => {
      queryClient.setQueryData(sessionQuery.queryKey, null);
      queryClient.removeQueries({ queryKey: ['admin'] });
    },
  });
}
