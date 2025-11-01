# Objetivo

Recriar o modulo `src/core/logger/` conforme estrutura atual, provendo loggers
(console e remoto stub), middleware com escolha por ambiente e barrel exports.

# Estrutura Necessaria

- `src/core/logger/logger.types.ts`
- `src/core/logger/log.console.ts`
- `src/core/logger/log.remote.ts`
- `src/core/logger/logger.middleware.ts`
- `src/core/logger/index.ts`

# Instrucao

1. Em `logger.types.ts` defina:
   - `LogLevel = "info" | "error" | "warn" | "debug"`.
   - `LogEntry` com campos `level`, `message`, `metadata?`, `error?`.
   - `Logger` com metodo `log(entry: LogEntry): Result<void, AppError>`.
   - Utilize comentarios JSDoc e exemplo.
2. Em `log.console.ts` crie `createConsoleLogger(options?)` retornando `Logger`
   que imprime `console.log`/`console.error` e devolve `result.Success`. Capture
   excecoes retornando `result.Error`. Inclua formatter default e exemplos.
3. Em `log.remote.ts` implemente `createRemoteLogger` retornando `Logger` que
   hoje devolve `result.Error` com
   `createAppError("LOGGER_REMOTE_NOT_IMPLEMENTED", ...)`.
4. Em `logger.middleware.ts`:
   - Importe `nodeProcess` de `deps.ts`.
   - Implemente `createLoggerMiddleware(options?)` que resolve logger via
     `createLogger(options)` e loga inicio/sucesso/erro das requests usando
     `result.from`.
   - Implemente `createLogger` que verifica env (`LOGGER_ENV`/`NODE_ENV`) e usa
     console logger para ambientes locais (`local`, `development`, `test`) ou
     remoto caso contrario.
   - Utilize comentarios e exemplos.
5. Em `index.ts` reexporte `createConsoleLogger`, `createRemoteLogger`,
   `createLoggerMiddleware`, `createLogger`, e os tipos (`Logger`, `LogEntry`,
   `LogLevel`).
6. Garante que `src/core/index.ts` exporta `./logger/index.ts`.
7. Comentarios em portugues brasileiro sem acentos e com blocos
   `Exemplo de uso`.

# Checagem

- Execute `deno check` nos arquivos do modulo.
- Verifique que nao ha imports diretos de bibliotecas externas exceto via
  `deps.ts`.
- Confirme que arquivos usam apenas ASCII e seguem padrao de nomenclatura
  (`log.console.ts`, etc.).
