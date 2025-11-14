/**
 * Middleware e factory de logger.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { nodeProcess, type Context, type MiddlewareHandler } from "../../deps.ts";
import { result } from "../helpers/index.ts";
import type { Logger } from "./logger.types.ts";
import { createConsoleLogger, type ConsoleLoggerOptions } from "./log.console.ts";
import { createRemoteLogger, type RemoteLoggerOptions } from "./log.remote.ts";

/** Opcoes para criar logger via factory. */
export interface CreateLoggerOptions {
  env?: string;
  console?: ConsoleLoggerOptions;
  remote?: RemoteLoggerOptions;
}

/**
 * Seleciona o logger com base no ambiente.
 * - local, development, test -> console
 * - demais -> remoto (stub)
 *
 * Exemplo de uso:
 * ```ts
 * const logger = createLogger({ env: "development" });
 * ```
 */
export function createLogger(options?: CreateLoggerOptions): Logger {
  const env = (options?.env
    ?? nodeProcess?.env?.LOGGER_ENV
    ?? nodeProcess?.env?.NODE_ENV
    ?? "development").toString().toLowerCase();

  const localLike = ["local", "development", "test"];
  if (localLike.includes(env)) return createConsoleLogger(options?.console);
  return createRemoteLogger(options?.remote);
}

/** Opcoes do middleware de logger. */
export interface LoggerMiddlewareOptions extends CreateLoggerOptions {}

/**
 * Cria middleware que registra inicio/sucesso/erro por request.
 * Usa result.from para tratar retorno do logger sem interromper o fluxo.
 *
 * Exemplo de uso:
 * ```ts
 * import { Hono } from "../../deps.ts";
 * import { createLoggerMiddleware } from "./logger.middleware.ts";
 * const app = new Hono();
 * app.use("*", createLoggerMiddleware());
 * ```
 */
export function createLoggerMiddleware(
  options?: LoggerMiddlewareOptions,
): MiddlewareHandler {
  const logger = createLogger(options);

  return async (c: Context, next) => {
    const startedAt = Date.now();
    const method = c.req.method;
    // Extrai pathname de forma segura
    let path: string;
    try {
      path = new URL(c.req.url).pathname;
    } catch {
      path = c.req.url;
    }

    // log de inicio
    result.from(logger.log({
      level: "info",
      message: "HTTP START",
      metadata: { method, path },
    }));

    try {
      await next();
      const status = c.res?.status ?? 200;
      const durationMs = Date.now() - startedAt;
      result.from(logger.log({
        level: "info",
        message: "HTTP SUCCESS",
        metadata: { method, path, status, durationMs },
      }));
    } catch (err) {
      const status = c.res?.status ?? 500;
      const durationMs = Date.now() - startedAt;
      result.from(logger.log({
        level: "error",
        message: "HTTP ERROR",
        metadata: { method, path, status, durationMs },
        error: err,
      }));
      throw err;
    }
  };
}
