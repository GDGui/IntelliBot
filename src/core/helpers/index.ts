// Barrel file para centralizar exportacoes dos helpers do core.

export { createAppError, isAppError, normalizeAppError } from "./errors.ts";
export type {
  AppError,
  AppErrorOptions,
  NormalizeAppErrorOptions,
} from "./errors.ts";

export { ApiErrors } from "./api_errors.ts";
export type { ApiErrorOptions } from "./api_errors.ts";

export { result, ResultHandler } from "./result.ts";
export type { Result } from "./result.ts";
