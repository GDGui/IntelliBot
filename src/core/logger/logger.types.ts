// src/core/logger/logger.types.ts

import { Result } from "../helpers/result.ts";
import { AppError } from "../helpers/errors.ts";

/**
 * @enum LogLevel
 * @description Define os niveis de log disponiveis na aplicacao.
 * 
 * @example
 * const level: LogLevel = "info";
 */
export type LogLevel = "info" | "error" | "warn" | "debug";

/**
 * @interface LogEntry
 * @description Representa uma entrada de log.
 * 
 * @property {LogLevel} level - O nivel do log.
 * @property {string} message - A mensagem de log.
 * @property {unknown} [metadata] - Dados adicionais para o log.
 * @property {Error} [error] - Um objeto de erro associado ao log.
 * 
 * @example
 * const entry: LogEntry = {
 *   level: "info",
 *   message: "Usuario logado com sucesso",
 *   metadata: { userId: 123 },
 * };
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: unknown;
  error?: Error;
}

/**
 * @interface Logger
 * @description Define a interface para um logger.
 * 
 * @method log - Registra uma entrada de log.
 * 
 * @example
 * const logger: Logger = createConsoleLogger();
 * logger.log({ level: "info", message: "Teste" });
 */
export interface Logger {
  log(entry: LogEntry): Result<void, AppError>;
}
