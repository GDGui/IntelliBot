// Barrel do modulo de logger

export type { LogLevel, LogEntry, Logger } from "./logger.types.ts";

export { createConsoleLogger } from "./log.console.ts";
export type { ConsoleLoggerOptions } from "./log.console.ts";

export { createRemoteLogger } from "./log.remote.ts";
export type { RemoteLoggerOptions } from "./log.remote.ts";

export {
  createLoggerMiddleware,
  createLogger,
} from "./logger.middleware.ts";
export type {
  CreateLoggerOptions,
  LoggerMiddlewareOptions,
} from "./logger.middleware.ts";

