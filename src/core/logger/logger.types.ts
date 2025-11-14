/**
 * Tipos base do modulo de logger.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import type { Result } from "../helpers/index.ts";
import type { AppError } from "../helpers/index.ts";

/** Niveis de log suportados. */
export type LogLevel = "info" | "error" | "warn" | "debug";

/** Estrutura de uma entrada de log. */
export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

/** Interface padrao de Logger. */
export interface Logger {
  /**
   * Registra uma entrada de log e retorna Result sem lancar excecao.
   *
   * Exemplo de uso:
   * ```ts
   * const res = logger.log({ level: "info", message: "Iniciando" });
   * if (res.isError()) {
   *   // tratar falha de log
   * }
   * ```
   */
  log(entry: LogEntry): Result<void, AppError>;
}

