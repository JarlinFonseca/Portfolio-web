import type { z } from 'zod';

/** Error de la API a partir de una respuesta application/problem+json (RFC 9457). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly fieldErrors: Record<string, string>;

  constructor(init: {
    status: number;
    code?: string;
    detail?: string;
    fieldErrors?: Record<string, string>;
  }) {
    super(init.detail || `HTTP ${init.status}`);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code ?? `HTTP_${init.status}`;
    this.detail = init.detail ?? '';
    this.fieldErrors = init.fieldErrors ?? {};
  }

  static async fromResponse(res: Response): Promise<ApiError> {
    const type = res.headers.get('content-type') ?? '';
    if (type.includes('json')) {
      try {
        const body = (await res.json()) as {
          code?: string;
          title?: string;
          detail?: string;
          errors?: Record<string, string> | { field: string; message: string }[];
        };
        const fieldErrors = Array.isArray(body.errors)
          ? Object.fromEntries(body.errors.map((e) => [e.field, e.message]))
          : (body.errors ?? {});
        return new ApiError({
          status: res.status,
          ...(body.code ? { code: body.code } : {}),
          detail: body.detail ?? body.title ?? res.statusText,
          fieldErrors,
        });
      } catch {
        // cuerpo inválido: se usa solo el estado
      }
    }
    return new ApiError({ status: res.status, detail: res.statusText });
  }
}

/** La respuesta no cumple el contrato Zod. */
export class ContractError extends Error {
  readonly contract: string;
  readonly issues: z.core.$ZodIssue[];

  constructor(contract: string, error: z.ZodError) {
    super(`La respuesta de «${contract}» no cumple el contrato`);
    this.name = 'ContractError';
    this.contract = contract;
    this.issues = error.issues;
  }
}

export class NetworkError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'NetworkError';
  }
}
