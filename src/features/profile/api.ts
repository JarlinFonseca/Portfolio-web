import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminProfile, ResumeFile } from '@/api/admin/model';
import type { Lang } from '@/api/public-portfolio/schema';
import { adminApi, adminUrl } from '@/lib/http/admin-api';
import { uploadFile } from '@/lib/http/upload';

export const profileKey = ['admin', 'profile'] as const;
export const accountKey = ['admin', 'account'] as const;

export const profileQuery = queryOptions({
  queryKey: profileKey,
  queryFn: ({ signal }) => adminApi.get<AdminProfile>('/admin/profile', signal),
});

export const accountQuery = queryOptions({
  queryKey: accountKey,
  queryFn: ({ signal }) => adminApi.get<{ loginEmail: string }>('/admin/account', signal),
});

export const useProfile = () => useQuery(profileQuery);
export const useAccount = () => useQuery(accountQuery);

export type ProfileInput = Omit<AdminProfile, 'photoUrl' | 'resume'>;

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileInput) => adminApi.put<AdminProfile>('/admin/profile', input),
    onSuccess: (data) => queryClient.setQueryData(profileKey, data),
  });
}

export function usePhoto() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: profileKey });
  return {
    upload: useMutation({
      mutationFn: ({ file, onProgress }: { file: File; onProgress?: (p: number) => void }) =>
        uploadFile<{ url: string }>(adminUrl('/admin/profile/photo'), {
          file,
          method: 'PUT',
          ...(onProgress ? { onProgress } : {}),
        }),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: () => adminApi.delete('/admin/profile/photo'), onSuccess: refresh }),
  };
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lang, file, onProgress }: { lang: Lang; file: File; onProgress?: (p: number) => void }) =>
      uploadFile<ResumeFile>(adminUrl(`/admin/profile/resume/${lang}`), {
        file,
        method: 'PUT',
        ...(onProgress ? { onProgress } : {}),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profileKey }),
  });
}

export function useChangeLoginEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => adminApi.put<{ loginEmail: string }>('/admin/account/email', { email }),
    onSuccess: (data) => {
      queryClient.setQueryData(accountKey, data);
      void queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      adminApi.put<void>('/admin/account/password', input),
  });
}
