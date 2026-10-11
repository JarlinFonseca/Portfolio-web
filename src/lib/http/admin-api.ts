import { env } from '@/config/env';
import { request } from './client';

/** Atajos para la API privada: misma base, cookie de sesión y evento de sesión vencida ante 401. */
export const adminUrl = (path: string) => `${env.API_BASE_URL}${path}`;

export const adminApi = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>('GET', adminUrl(path), { signal, admin: true }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', adminUrl(path), { body, admin: true }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', adminUrl(path), { body, admin: true }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', adminUrl(path), { body, admin: true }),
  delete: (path: string) => request<void>('DELETE', adminUrl(path), { admin: true }),
};
