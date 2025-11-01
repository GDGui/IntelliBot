// src/core/logger/log.remote.ts

import { result, Result } from "../helpers/result.ts";
import { AppError, createAppError } from "../helpers/errors.ts";
import { LogEntry, Logger } from "./logger.types.ts";

/**
 * @interface RemoteLoggerOptions
 * @description Opcoes para o logger remoto.
 * 
 * @property {string} apiUrl - A URL da API de logging.
 * @property {string} apiKey - A chave de API para autenticacao.
 */
export interface RemoteLoggerOptions {
  apiUrl: string;
  apiKey: string;
}

/**
 * @function createRemoteLogger
 * @description Cria um logger que envia logs para um servico remoto.
 * 
 * @param {RemoteLoggerOptions} options - Opcoes para o logger.
 * @returns {Logger} - Uma instancia de Logger.
 * 
 * @example
 * const logger = createRemoteLogger({ apiUrl: "...", apiKey: "..." });
 * logger.log({ level: "info", message: "Teste" });
 */
export function createRemoteLogger(options: RemoteLoggerOptions): Logger {
  const log = (entry: LogEntry): Result<void, AppError> => {
    // TODO: Implement remote logging
    return result.Error(
      createAppError(
        "LOGGER_REMOTE_NOT_IMPLEMENTED",
        "Remote logger is not implemented yet.",
        { details: { entry, options } }
      )
    ).unwrap();
  };

  return { log };
}
