/**
 * Utilitarios de erros do core.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

/** Interface de erro padrao da aplicacao. */
export interface AppError {
  code: string;
  message: string;
  status?: number;
  cause?: unknown;
  details?: unknown;
}

/** Opcoes opcionais para criacao de AppError. */
export interface AppErrorOptions {
  status?: number;
  cause?: unknown;
  details?: unknown;
}

/** Opcoes para normalizacao de erros desconhecidos. */
export interface NormalizeAppErrorOptions extends AppErrorOptions {
  code?: string;
  message?: string;
}

/**
 * Cria um AppError padrao com code e message.
 *
 * Exemplo de uso:
 * ```ts
 * const err = createAppError(
 *   "VALIDATION_ERROR",
 *   "Campo obrigatorio ausente",
 *   { status: 400, details: { field: "name" } },
 * );
 * ```
 */
export function createAppError(
  code: string,
  message: string,
  options?: AppErrorOptions,
): AppError {
  return {
    code,
    message,
    status: options?.status,
    details: options?.details,
    cause: options?.cause,
  };
}

/**
 * Type guard para verificar se o valor e um AppError.
 *
 * Exemplo de uso:
 * ```ts
 * const maybeErr: unknown = getSomething();
 * if (isAppError(maybeErr)) {
 *   console.log(maybeErr.code);
 * }
 * ```
 */
export function isAppError(input: unknown): input is AppError {
  if (typeof input !== "object" || input === null) return false;
  const obj = input as Record<string, unknown>;
  return typeof obj.code === "string" && typeof obj.message === "string";
}

/**
 * Normaliza um valor desconhecido para AppError.
 * - Se ja for AppError, retorna o proprio valor.
 * - Caso contrario, cria AppError com defaults e preserva status/details e causa.
 *
 * Exemplo de uso:
 * ```ts
 * try {
 *   doWork();
 * } catch (e) {
 *   const appErr = normalizeAppError(e, {
 *     code: "UNKNOWN_ERROR",
 *     message: "Erro nao tratado",
 *     status: 500,
 *   });
 * }
 * ```
 */
export function normalizeAppError(
  input: unknown,
  options?: NormalizeAppErrorOptions,
): AppError {
  if (isAppError(input)) return input;

  const code = options?.code ?? "UNKNOWN_ERROR";
  const message = options?.message ?? "Erro nao tratado";
  return createAppError(code, message, {
    status: options?.status,
    details: options?.details,
    cause: input,
  });
}

