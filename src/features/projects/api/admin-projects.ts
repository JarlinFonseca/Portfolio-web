import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminProject, ProjectImage } from '@/api/admin/model';
import { adminApi, adminUrl } from '@/lib/http/admin-api';
import { uploadFile } from '@/lib/http/upload';

export const projectsKey = ['admin', 'projects'] as const;

export const projectsQuery = queryOptions({
  queryKey: projectsKey,
  queryFn: ({ signal }) => adminApi.get<AdminProject[]>('/admin/projects', signal),
});

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: [...projectsKey, id],
    queryFn: ({ signal }) => adminApi.get<AdminProject>(`/admin/projects/${id}`, signal),
  });

export const useProjects = () => useQuery(projectsQuery);

export type ProjectInput = Omit<AdminProject, 'id' | 'images' | 'coverImageId' | 'version'> & {
  version?: number;
};

function useInvalidateProjects() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: projectsKey });
}

export function useSaveProject() {
  const invalidate = useInvalidateProjects();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string | undefined; input: ProjectInput }) =>
      id
        ? adminApi.put<AdminProject>(`/admin/projects/${id}`, input)
        : adminApi.post<AdminProject>('/admin/projects', input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete(`/admin/projects/${id}`),
    onSuccess: (_, id) => {
      queryClient.setQueryData<AdminProject[]>(projectsKey, (old) => old?.filter((p) => p.id !== id));
      void queryClient.invalidateQueries({ queryKey: projectsKey });
    },
  });
}

/** Visibilidad con actualización optimista; si falla, se revierte. */
export function useToggleVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, visible }: { id: string; visible: boolean }) =>
      adminApi.patch<AdminProject>(`/admin/projects/${id}/visibility`, { visible }),
    onMutate: async ({ id, visible }) => {
      await queryClient.cancelQueries({ queryKey: projectsKey });
      const previous = queryClient.getQueryData<AdminProject[]>(projectsKey);
      queryClient.setQueryData<AdminProject[]>(projectsKey, (old) =>
        old?.map((p) => (p.id === id ? { ...p, visible } : p)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(projectsKey, ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: projectsKey }),
  });
}

/** Orden con actualización optimista y PATCH .../order; si falla, se revierte. */
export function useReorderProjects() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: AdminProject[]) =>
      adminApi.patch<void>('/admin/projects/order', { ids: items.map((p) => p.id) }),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: projectsKey });
      const previous = queryClient.getQueryData<AdminProject[]>(projectsKey);
      queryClient.setQueryData(projectsKey, items);
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(projectsKey, ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: projectsKey }),
  });
}

export type UploadedImage = ProjectImage & { isCover: boolean };

export const projectImagesApi = {
  upload: (projectId: string, file: File, alt: string, onProgress?: (p: number) => void) =>
    uploadFile<UploadedImage>(adminUrl(`/admin/projects/${projectId}/images`), {
      file,
      fields: { alt },
      ...(onProgress ? { onProgress } : {}),
    }),
  update: (projectId: string, imageId: string, patch: { alt?: string; cover?: boolean }) =>
    adminApi.patch<UploadedImage>(`/admin/projects/${projectId}/images/${imageId}`, patch),
  remove: (projectId: string, imageId: string) =>
    adminApi.delete(`/admin/projects/${projectId}/images/${imageId}`),
};

/** Sube archivos en cola con un máximo de `concurrency` a la vez. */
export async function uploadQueue<T>(items: T[], worker: (item: T) => Promise<void>, concurrency = 2) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (next !== undefined) await worker(next);
    }
  });
  await Promise.all(runners);
}
