import { logger } from '@/lib/logger';
import { ApiError, NetworkError } from './api-error';
import { CSRF_HEADER, readCsrfToken } from './csrf';

export const SESSION_EXPIRED_EVENT = 'session-expired';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  signal?: AbortSignal | undefined;
  timeoutMs?: number;
  body?: unknown;
  /** Si es true, un 401 dispara el evento de sesión vencida (rutas del admin). */
  admin?: boolean;
  /** Espera entre reintentos (configurable para pruebas). */
  retryDelayMs?: number;
}

const RETRYABLE = new Set([502, 503, 504]);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Único punto de salida HTTP: credenciales, timeout, reintento de GET, CSRF y errores RFC 9457. */
export async function request<T = unknown>(
  method: Method,
  url: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { signal, timeoutMs = 10_000, body, admin = false, retryDelayMs = 300 } = opts;
  const attempts = method === 'GET' ? 2 : 1;

  for (let attempt = 1; ; attempt++) {
    const started = Date.now();
    const signals = [AbortSignal.timeout(timeoutMs), ...(signal ? [signal] : [])];
    const headers: Record<string, string> = { Accept: 'application/json, application/problem+json' };
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
    if (method !== 'GET') {
      const token = readCsrfToken();
      if (token) headers[CSRF_HEADER] = token;
    }

    let res: Response;
    try {
      const init: RequestInit = { method, headers, credentials: 'include', signal: AbortSignal.any(signals) };
      if (body !== undefined) init.body = isForm ? (body as FormData) : JSON.stringify(body);
      res = await fetch(url, init);
    } catch (cause) {
      if (signal?.aborted) throw cause;
      if (attempt < attempts) {
        await wait(retryDelayMs);
        continue;
      }
      logger.warn('http: error de red', { method, url, ms: Date.now() - started });
      throw new NetworkError(`No se pudo conectar con ${url}`, { cause });
    }

    if (!res.ok && RETRYABLE.has(res.status) && attempt < attempts) {
      await wait(retryDelayMs);
      continue;
    }

    if (!res.ok) {
      logger.warn('http: respuesta con error', { method, url, status: res.status, ms: Date.now() - started });
      if (res.status === 401 && admin && typeof window !== 'undefined') {
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      }
      throw await ApiError.fromResponse(res);
    }

    if (res.status === 204) return undefined as T;
    const type = res.headers.get('content-type') ?? '';
    return (type.includes('json') ? await res.json() : await res.text()) as T;
  }
}

export const httpGet = <T = unknown>(url: string, opts?: Omit<RequestOptions, 'body'>) =>
  request<T>('GET', url, opts);
