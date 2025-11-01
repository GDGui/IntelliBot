// src/core/logger/logger.middleware.ts

import { MiddlewareHandler } from "../../deps.ts";
import { Result } from "../helpers/result.ts";
import { createConsoleLogger } from "./log.console.ts";
import { createRemoteLogger } from "./log.remote.ts";
import { Logger } from "./logger.types.ts";
import { nodeProcess } from "../../deps.ts";

/**
 * @interface LoggerMiddlewareOptions
 * @description Opcoes para o middleware de logger.
 * 
 * @property {boolean} [pretty] - Formata o log de forma mais legivel (apenas para console logger).
 */
export interface LoggerMiddlewareOptions {
  pretty?: boolean;
}

/**
 * @function createLogger
 * @description Cria uma instancia de logger com base no ambiente.
 * 
 * @param {LoggerMiddlewareOptions} [options] - Opcoes para o logger.
 * @returns {Logger} - Uma instancia de Logger.
 */
export function createLogger(options?: LoggerMiddlewareOptions): Logger {
  const loggerEnv = nodeProcess.env.LOGGER_ENV || nodeProcess.env.NODE_ENV;

  switch (loggerEnv) {
    case "local":
    case "development":
    case "test":
      return createConsoleLogger({ pretty: options?.pretty });
    default:
      // TODO: Get apiUrl and apiKey from env
      return createRemoteLogger({ apiUrl: "", apiKey: "" });
  }
}

/**
 * @function createLoggerMiddleware
 * @description Cria um middleware de logger para o Hono.
 * 
 * @param {LoggerMiddlewareOptions} [options] - Opcoes para o middleware.
 * @returns {MiddlewareHandler} - Um middleware do Hono.
 * 
 * @example
 * const app = new Hono();
 * app.use('*', createLoggerMiddleware({ pretty: true }));
 */
export function createLoggerMiddleware(options?: LoggerMiddlewareOptions): MiddlewareHandler {
  const logger = createLogger(options);

  return async (c, next) => {
    const start = Date.now();
    logger.log({
      level: "info",
      message: `Request started: ${c.req.method} ${c.req.url}`,
      metadata: {
        method: c.req.method,
        url: c.req.url,
      },
    });

    await next();

    const ms = Date.now() - start;
    const result = c.res.status < 400 ? "Success" : "Error";

    logger.log({
      level: result === "Success" ? "info" : "error",
      message: `Request finished in ${ms}ms with status ${c.res.status}`,
      metadata: {
        method: c.req.method,
        url: c.req.url,
        status: c.res.status,
        duration: ms,
      },
    });
  };
}
