import { useCallback, useState } from 'react';
import { ApiError, NetworkError } from './api-error';
import { SESSION_EXPIRED_EVENT } from './client';
import { CSRF_HEADER, readCsrfToken } from './csrf';

export interface FileRule {
  types: readonly string[];
  maxBytes: number;
}

export const IMAGE_RULE: FileRule = {
  types: ['image/png', 'image/jpeg', 'image/webp'],
  maxBytes: 5 * 1024 * 1024,
};
export const PDF_RULE: FileRule = { types: ['application/pdf'], maxBytes: 10 * 1024 * 1024 };

/** Validación en el cliente antes de enviar (la API vuelve a validar). */
export function validateFile(file: File, rule: FileRule): 'type' | 'size' | null {
  if (!rule.types.includes(file.type)) return 'type';
  if (file.size > rule.maxBytes) return 'size';
  return null;
}

/**
 * Sube multipart/form-data con XMLHttpRequest para reportar el progreso.
 * Lo usan proyectos (imágenes) y perfil (foto y CV).
 */
export function uploadFile<T>(
  url: string,
  {
    file,
    fields = {},
    method = 'POST',
    onProgress,
  }: {
    file: File;
    fields?: Record<string, string>;
    method?: 'POST' | 'PUT';
    onProgress?: (percent: number) => void;
  },
): Promise<T> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(fields).forEach(([k, v]) => form.append(k, v));

    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json, application/problem+json');
    const token = readCsrfToken();
    if (token) xhr.setRequestHeader(CSRF_HEADER, token);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onerror = () => reject(new NetworkError(`No se pudo subir ${file.name}`));
    xhr.onload = () => {
      const body: unknown = xhr.responseText ? safeJson(xhr.responseText) : undefined;
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(body as T);
        return;
      }
      if (xhr.status === 401) window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      const problem = (body ?? {}) as { code?: string; detail?: string; errors?: Record<string, string> };
      reject(
        new ApiError({
          status: xhr.status,
          ...(problem.code ? { code: problem.code } : {}),
          detail: problem.detail ?? xhr.statusText,
          fieldErrors: problem.errors ?? {},
        }),
      );
    };
    xhr.send(form);
  });
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/** Estado de una subida con progreso. */
export function useFileUpload() {
  const [progress, setProgress] = useState<number | null>(null);
  const upload = useCallback(async <T>(url: string, options: Parameters<typeof uploadFile>[1]) => {
    setProgress(0);
    try {
      return await uploadFile<T>(url, { ...options, onProgress: setProgress });
    } finally {
      setProgress(null);
    }
  }, []);
  return { upload, progress, uploading: progress !== null };
}
