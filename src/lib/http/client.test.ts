import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/testing/msw/server';
import { ApiError, NetworkError } from './api-error';
import { request, SESSION_EXPIRED_EVENT } from './client';
import { readCsrfToken } from './csrf';

const URL_ = 'http://api.test/thing';

describe('cliente HTTP', () => {
  afterEach(() => {
    document.cookie = 'XSRF-TOKEN=; max-age=0';
  });

  it('reintenta una vez un GET ante 503', async () => {
    let calls = 0;
    server.use(
      http.get(URL_, () => {
        calls++;
        return calls === 1 ? new HttpResponse(null, { status: 503 }) : HttpResponse.json({ ok: true });
      }),
    );
    await expect(request('GET', URL_, { retryDelayMs: 0 })).resolves.toEqual({ ok: true });
    expect(calls).toBe(2);
  });

  it('no reintenta un POST', async () => {
    let calls = 0;
    server.use(
      http.post(URL_, () => {
        calls++;
        return new HttpResponse(null, { status: 503 });
      }),
    );
    await expect(request('POST', URL_, { body: {}, retryDelayMs: 0 })).rejects.toBeInstanceOf(ApiError);
    expect(calls).toBe(1);
  });

  it('envía X-XSRF-TOKEN en escrituras', async () => {
    document.cookie = 'XSRF-TOKEN=abc123';
    let header: string | null = null;
    server.use(
      http.put(URL_, ({ request: req }) => {
        header = req.headers.get('X-XSRF-TOKEN');
        return new HttpResponse(null, { status: 204 });
      }),
    );
    await request('PUT', URL_, { body: { a: 1 } });
    expect(header).toBe('abc123');
  });

  it('un 401 del admin dispara el evento de sesión vencida', async () => {
    server.use(http.get(URL_, () => new HttpResponse(null, { status: 401 })));
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    await expect(request('GET', URL_, { admin: true })).rejects.toMatchObject({ status: 401 });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
  });

  it('un error de red se convierte en NetworkError', async () => {
    server.use(http.get(URL_, () => HttpResponse.error()));
    await expect(request('GET', URL_, { retryDelayMs: 0 })).rejects.toBeInstanceOf(NetworkError);
  });

  it('204 devuelve undefined', async () => {
    server.use(http.delete(URL_, () => new HttpResponse(null, { status: 204 })));
    await expect(request('DELETE', URL_)).resolves.toBeUndefined();
  });
});

describe('readCsrfToken', () => {
  it('lee el token de la cookie', () => expect(readCsrfToken('a=1; XSRF-TOKEN=x%20y')).toBe('x y'));
  it('null si no existe', () => expect(readCsrfToken('a=1')).toBeNull());
});
