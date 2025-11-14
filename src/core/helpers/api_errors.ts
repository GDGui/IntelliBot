/**
 * Helpers para criacao de AppError especificos de HTTP (Presenter).
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { createAppError, normalizeAppError } from "./errors.ts";
import type { AppError, NormalizeAppErrorOptions } from "./errors.ts";

/**
 * Opcoes para criar erros de API.
 * - code: opcionalmente sobrescreve o codigo padrao do erro HTTP
 * - details: dados adicionais do contexto do erro
 * - cause: causa original do erro
 */
export interface ApiErrorOptions {
  code?: string;
  details?: unknown;
  cause?: unknown;
}

/**
 * Colecao de fabricas para AppError com semantica HTTP.
 * Cada metodo delega para `create` com um code padrao e status HTTP.
 */
export class ApiErrors {
  /**
   * Converte um erro desconhecido em AppError, aplicando defaults de 500.
   *
   * Exemplo de uso:
   * ```ts
   * try {
   *   handler();
   * } catch (e) {
   *   const err = ApiErrors.fromUnknown(e);
   * }
   * ```
   */
  static fromUnknown(
    error: unknown,
    fallback?: NormalizeAppErrorOptions,
  ): AppError {
    return normalizeAppError(error, {
      code: fallback?.code ?? "INTERNAL_SERVER_ERROR",
      message: fallback?.message ?? "Erro inesperado",
      status: fallback?.status ?? 500,
      details: fallback?.details,
      cause: fallback?.cause,
    });
  }

  /**
   * 400 Bad Request
   *
   * Exemplo de uso:
   * ```ts
   * const err = ApiErrors.badRequest("Payload invalido", { details: { f: "x" } });
   * ```
   */
  static badRequest(message: string, options?: ApiErrorOptions): AppError {
    return this.create("BAD_REQUEST", 400, message, options);
  }

  /** 401 Unauthorized */
  static unauthorized(message: string, options?: ApiErrorOptions): AppError {
    return this.create("UNAUTHORIZED", 401, message, options);
  }

  /** 403 Forbidden */
  static forbidden(message: string, options?: ApiErrorOptions): AppError {
    return this.create("FORBIDDEN", 403, message, options);
  }

  /** 404 Not Found */
  static notFound(message: string, options?: ApiErrorOptions): AppError {
    return this.create("NOT_FOUND", 404, message, options);
  }

  /** 405 Method Not Allowed */
  static methodNotAllowed(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("METHOD_NOT_ALLOWED", 405, message, options);
  }

  /** 409 Conflict */
  static conflict(message: string, options?: ApiErrorOptions): AppError {
    return this.create("CONFLICT", 409, message, options);
  }

  /** 410 Gone */
  static gone(message: string, options?: ApiErrorOptions): AppError {
    return this.create("GONE", 410, message, options);
  }

  /** 412 Precondition Failed */
  static preconditionFailed(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("PRECONDITION_FAILED", 412, message, options);
  }

  /** 415 Unsupported Media Type */
  static unsupportedMediaType(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("UNSUPPORTED_MEDIA_TYPE", 415, message, options);
  }

  /** 422 Unprocessable Entity */
  static unprocessableEntity(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("UNPROCESSABLE_ENTITY", 422, message, options);
  }

  /** 429 Too Many Requests */
  static tooManyRequests(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("TOO_MANY_REQUESTS", 429, message, options);
  }

  /** 500 Internal Server Error */
  static internal(message: string, options?: ApiErrorOptions): AppError {
    return this.create("INTERNAL_SERVER_ERROR", 500, message, options);
  }

  /** 501 Not Implemented */
  static notImplemented(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("NOT_IMPLEMENTED", 501, message, options);
  }

  /** 502 Bad Gateway */
  static badGateway(message: string, options?: ApiErrorOptions): AppError {
    return this.create("BAD_GATEWAY", 502, message, options);
  }

  /** 503 Service Unavailable */
  static serviceUnavailable(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("SERVICE_UNAVAILABLE", 503, message, options);
  }

  /** 504 Gateway Timeout */
  static gatewayTimeout(
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return this.create("GATEWAY_TIMEOUT", 504, message, options);
  }

  /**
   * Cria erro HTTP customizado.
   *
   * Exemplo de uso:
   * ```ts
   * const err = ApiErrors.custom("RATE_LIMIT", 429, "Muitas requisicoes", { details: { limit: 60 } });
   * ```
   */
  static custom(
    code: string,
    status: number,
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    return createAppError(code, message, {
      status,
      details: options?.details,
      cause: options?.cause,
    });
  }

  /** Metodo auxiliar privado para criar erros HTTP com code padrao. */
  private static create(
    defaultCode: string,
    status: number,
    message: string,
    options?: ApiErrorOptions,
  ): AppError {
    const code = options?.code ?? defaultCode;
    return createAppError(code, message, {
      status,
      details: options?.details,
      cause: options?.cause,
    });
  }
}

