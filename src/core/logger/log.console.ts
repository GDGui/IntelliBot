/**
 * Implementacao de logger via console.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { createAppError, result } from "../helpers/index.ts";
import type { AppError } from "../helpers/index.ts";
import type { LogEntry, LogLevel, Logger } from "./logger.types.ts";

/** Opcoes para o logger de console. */
export interface ConsoleLoggerOptions {
  /**
   * Funcao que formata a mensagem principal do log.
   * Recebe a entrada completa e retorna uma string para exibicao.
   */
  formatter?: (entry: LogEntry) => string;
}

/** Formatter padrao para o console logger. */
function defaultFormatter(entry: LogEntry): string {
  const lvl = entry.level.toUpperCase();
  const base = `[${lvl}] ${entry.message}`;
  return base;
}

/**
 * Cria um Logger que escreve no console.
 *
 * Exemplo de uso:
 * ```ts
 * const logger = createConsoleLogger();
 * logger.log({ level: "info", message: "Aplicacao iniciada" });
 * ```
 */
export function createConsoleLogger(
  options?: ConsoleLoggerOptions,
): Logger {
  const fmt = options?.formatter ?? defaultFormatter;

  const write = (level: LogLevel, msg: string, extra?: unknown[]) => {
    if (level === "error") return console.error(msg, ...(extra ?? []));
    if (level === "warn") return console.warn(msg, ...(extra ?? []));
    if (level === "debug") return console.debug(msg, ...(extra ?? []));
    return console.log(msg, ...(extra ?? []));
  };

  return {
    log(entry: LogEntry) {
      try {
        const message = fmt(entry);
        const extras: unknown[] = [];
        if (entry.metadata !== undefined) extras.push(entry.metadata);
        if (entry.error !== undefined) extras.push(entry.error);
        write(entry.level, message, extras);
        return result.Success<void, AppError>(undefined).unwrap();
      } catch (e) {
        return result.Error<void, AppError>(
          createAppError(
            "LOGGER_CONSOLE_FAILURE",
            "Falha ao registrar log no console",
            { cause: e },
          ),
        ).unwrap();
      }
    },
  };
}
