// src/core/logger/log.console.ts

import { result, Result } from "../helpers/result.ts";
import { AppError, createAppError } from "../helpers/errors.ts";
import { LogEntry, Logger } from "./logger.types.ts";

/**
 * @interface ConsoleLoggerOptions
 * @description Opcoes para o logger de console.
 * 
 * @property {boolean} [pretty] - Formata o log de forma mais legivel.
 */
export interface ConsoleLoggerOptions {
  pretty?: boolean;
}

/**
 * @function createConsoleLogger
 * @description Cria um logger que imprime no console.
 * 
 * @param {ConsoleLoggerOptions} [options] - Opcoes para o logger.
 * @returns {Logger} - Uma instancia de Logger.
 * 
 * @example
 * const logger = createConsoleLogger({ pretty: true });
 * logger.log({ level: "info", message: "Teste" });
 */
export function createConsoleLogger(options?: ConsoleLoggerOptions): Logger {
  const log = (entry: LogEntry): Result<void, AppError> => {
    try {
      const { level, message, metadata, error } = entry;
      const timestamp = new Date().toISOString();
      const logMessage = options?.pretty
        ? `[${timestamp}] [${level.toUpperCase()}] ${message}`
        : JSON.stringify({ timestamp, level, message, metadata, error });

      if (level === "error") {
        console.error(logMessage, metadata, error);
      } else {
        console.log(logMessage, metadata || "");
      }

      return result.Success(undefined).unwrap();
    } catch (e) {
      return result.Error(createAppError("CONSOLE_LOGGER_ERROR", e.message, { cause: e })).unwrap();
    }
  };

  return { log };
}
