/**
 * Implementacao stub de logger remoto.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { createAppError, result } from "../helpers/index.ts";
import type { AppError } from "../helpers/index.ts";
import type { Logger, LogEntry } from "./logger.types.ts";

/** Opcoes para o logger remoto (stub). */
export interface RemoteLoggerOptions {
  endpoint?: string;
  token?: string;
  timeoutMs?: number;
}

/**
 * Cria um Logger remoto (ainda nao implementado).
 * Sempre retorna erro "LOGGER_REMOTE_NOT_IMPLEMENTED".
 *
 * Exemplo de uso:
 * ```ts
 * const logger = createRemoteLogger();
 * const r = logger.log({ level: "info", message: "Teste" });
 * // r.isError() === true
 * ```
 */
export function createRemoteLogger(_options?: RemoteLoggerOptions): Logger {
  return {
    log(_entry: LogEntry) {
      return result.Error<void, AppError>(
        createAppError(
          "LOGGER_REMOTE_NOT_IMPLEMENTED",
          "Logger remoto nao implementado",
        ),
      ).unwrap();
    },
  };
}
