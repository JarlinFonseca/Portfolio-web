import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ApiError, ContractError } from '@/lib/http/api-error';
import { server } from '@/testing/msw/server';
import { createHttpSource } from './http-source';

const source = createHttpSource({ baseUrl: 'http://api.test/api' });

describe('fuente HTTP', () => {
  it('devuelve los datos validados con el contrato', async () => {
    const data = await source.getPortfolio('en');
    expect(data.lang).toBe('en');
    expect(data.projects.length).toBeGreaterThan(0);
  });

  it('un 500 se convierte en ApiError', async () => {
    server.use(
      http.get('*/api/public/portfolio', () =>
        HttpResponse.json(
          { status: 500, code: 'INTERNAL', detail: 'falló' },
          { status: 500, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    );
    await expect(source.getPortfolio('es')).rejects.toMatchObject({
      name: 'ApiError',
      status: 500,
      code: 'INTERNAL',
    });
  });

  it('un JSON que no cumple el contrato lanza ContractError', async () => {
    server.use(http.get('*/api/public/portfolio', () => HttpResponse.json({ lang: 'es', projects: 'roto' })));
    await expect(source.getPortfolio('es')).rejects.toBeInstanceOf(ContractError);
  });

  it('ApiError conserva los errores de campo', async () => {
    server.use(
      http.get('*/api/public/portfolio', () =>
        HttpResponse.json(
          { detail: 'inválido', errors: [{ field: 'lang', message: 'no soportado' }] },
          { status: 400, headers: { 'Content-Type': 'application/problem+json' } },
        ),
      ),
    );
    const error = (await source.getPortfolio('es').catch((e: unknown) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.fieldErrors).toEqual({ lang: 'no soportado' });
  });
});
