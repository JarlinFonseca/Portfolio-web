import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AdminCertification,
  AdminEducation,
  AdminExperience,
  AdminLanguage,
  CareerKind,
} from '@/api/admin/model';
import { adminApi } from '@/lib/http/admin-api';

export interface CareerItemMap {
  experience: AdminExperience;
  education: AdminEducation;
  certifications: AdminCertification;
  languages: AdminLanguage;
}

/** Ruta de la API por pestaña (sección 4.12 de la arquitectura). */
export const CAREER_PATHS: Record<CareerKind, string> = {
  experience: '/admin/experiences',
  education: '/admin/educations',
  certifications: '/admin/certifications',
  languages: '/admin/languages',
};

/** La experiencia se ordena siempre por fecha; el resto se ordena arrastrando (RF-TRA-03). */
export const ORDERABLE: Record<CareerKind, boolean> = {
  experience: false,
  education: true,
  certifications: true,
  languages: true,
};

export const careerKey = (kind: CareerKind) => ['admin', 'career', kind] as const;

export const careerQuery = <K extends CareerKind>(kind: K) =>
  queryOptions({
    queryKey: careerKey(kind),
    queryFn: ({ signal }) => adminApi.get<CareerItemMap[K][]>(CAREER_PATHS[kind], signal),
  });

export const useCareerList = <K extends CareerKind>(kind: K) => useQuery(careerQuery(kind));

export function useSaveCareerItem<K extends CareerKind>(kind: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string | undefined; input: Omit<CareerItemMap[K], 'id'> }) =>
      id
        ? adminApi.put<CareerItemMap[K]>(`${CAREER_PATHS[kind]}/${id}`, input)
        : adminApi.post<CareerItemMap[K]>(CAREER_PATHS[kind], input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careerKey(kind) }),
  });
}

export function useDeleteCareerItem(kind: CareerKind) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete(`${CAREER_PATHS[kind]}/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: careerKey(kind) }),
  });
}

export function useReorderCareer<K extends CareerKind>(kind: K) {
  const queryClient = useQueryClient();
  const key = careerKey(kind);
  return useMutation({
    mutationFn: (items: CareerItemMap[K][]) =>
      adminApi.patch<void>(`${CAREER_PATHS[kind]}/order`, { ids: items.map((i) => i.id) }),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, items);
      return { previous };
    },
    onError: (_e, _v, ctx) => queryClient.setQueryData(key, ctx?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
