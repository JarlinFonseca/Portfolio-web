import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '@/testing/msw/server';
import { ApiError } from './api-error';
import { SESSION_EXPIRED_EVENT } from './client';
import { IMAGE_RULE, PDF_RULE, uploadFile, useFileUpload, validateFile } from './upload';

// mismo origen que jsdom: así XMLHttpRequest no hace preflight CORS
const URL_ = `${window.location.origin}/api/upload`;
const png = (bytes = 10) => new File([new Uint8Array(bytes)], 'captura.png', { type: 'image/png' });

describe('validateFile', () => {
  it('acepta PNG, JPG y WebP de hasta 5 MB', () => {
    expect(validateFile(png(), IMAGE_RULE)).toBeNull();
    expect(validateFile(new File(['x'], 'a.gif', { type: 'image/gif' }), IMAGE_RULE)).toBe('type');
    expect(validateFile(png(5 * 1024 * 1024 + 1), IMAGE_RULE)).toBe('size');
  });
  it('el CV solo acepta PDF', () => {
    expect(validateFile(new File(['x'], 'cv.pdf', { type: 'application/pdf' }), PDF_RULE)).toBeNull();
    expect(validateFile(png(), PDF_RULE)).toBe('type');
  });
});

describe('uploadFile', () => {
  it('envía multipart con el archivo y los campos', async () => {
    let received: { name?: string; alt?: string } = {};
    server.use(
      http.post(URL_, async ({ request }) => {
        const form = await request.formData();
        received = { name: (form.get('file') as File).name, alt: String(form.get('alt')) };
        return HttpResponse.json({ id: 'img-1' }, { status: 201 });
      }),
    );
    const onProgress = vi.fn();
    await expect(uploadFile(URL_, { file: png(), fields: { alt: 'Captura' }, onProgress })).resolves.toEqual({
      id: 'img-1',
    });
    expect(received).toEqual({ name: 'captura.png', alt: 'Captura' });
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it('convierte un 422 en ApiError con sus errores de campo', async () => {
    server.use(
      http.put(URL_, () =>
        HttpResponse.json(
          { code: 'FILE_TOO_LARGE', detail: 'La imagen supera 5 MB', errors: { file: 'muy grande' } },
          { status: 422 },
        ),
      ),
    );
    const error = (await uploadFile(URL_, { file: png(), method: 'PUT' }).catch(
      (e: unknown) => e,
    )) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, code: 'FILE_TOO_LARGE', fieldErrors: { file: 'muy grande' } });
  });

  it('un 401 dispara el evento de sesión vencida', async () => {
    server.use(http.post(URL_, () => new HttpResponse(null, { status: 401 })));
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    await expect(uploadFile(URL_, { file: png() })).rejects.toBeInstanceOf(ApiError);
    expect(listener).toHaveBeenCalled();
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
  });
});

describe('useFileUpload', () => {
  it('expone el estado de la subida', async () => {
    server.use(http.post(URL_, () => HttpResponse.json({ ok: true })));
    const { result } = renderHook(() => useFileUpload());
    expect(result.current.uploading).toBe(false);
    await act(async () => {
      await result.current.upload(URL_, { file: png() });
    });
    expect(result.current.progress).toBeNull();
  });
});
