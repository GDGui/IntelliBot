# Objetivo

Reconstruir completamente a pasta `src/core/helpers`, criando os arquivos
`errors.ts`, `api_errors.ts` e `result.ts` com o mesmo conteudo e estilo
existentes, incluindo comentarios em portugues brasileiro sem acentuacao e
exemplos de uso.

# Instrucao

1. Garanta que o caminho `src/core/helpers` exista. Caso nao exista, crie a
   pasta respeitando a hierarquia.

## Arquivo `src/core/helpers/errors.ts`

2. Defina as interfaces:
   - `AppError` com campos `code`, `message`, `status?`, `cause?`, `details?`.
   - `AppErrorOptions` com `status?`, `cause?`, `details?`.
   - `NormalizeAppErrorOptions` estendendo `AppErrorOptions` e adicionando
     `code?` e `message?`.
3. Implemente as funcoes exportadas:
   - `createAppError` recebendo `code`, `message`, `options?` e retornando
     objeto com os campos declarados. Inclua comentario JSDoc com descricao em
     PT-BR (ASCII) e bloco `Exemplo de uso` demonstrando criacao com `status` e
     `details`.
   - `isAppError` como type guard verificando se um valor possui propriedades
     `code` e `message`. Documente com comentario JSDoc e exemplo simples de
     condicional.
   - `normalizeAppError` recebendo `input` e `options?`, retornando `AppError`.
     Deve:
     - Retornar `input` se `isAppError(input)` for verdadeiro.
     - Caso contrario, chamar `createAppError` utilizando
       `options.code ?? "UNKNOWN_ERROR"` e
       `options.message ?? "Erro nao tratado"`, preservando `status`, `details`
       e atribuindo `cause: input`.
     - Possuir comentario JSDoc com bloco `Exemplo de uso`.
4. Certifique-se de que todos os comentarios utilizem apenas ASCII e estejam em
   portugues brasileiro.

## Arquivo `src/core/helpers/api_errors.ts`

5. Importe `createAppError` e `normalizeAppError` (import normal) e `AppError`
   (import de tipo) do arquivo `errors.ts`.
6. Declare a interface `ApiErrorOptions` com campos `code?`, `details?`,
   `cause?`, acompanhada de comentario JSDoc com descricao em PT-BR.
7. Crie a classe `ApiErrors` com os metodos estaticos abaixo, cada um retornando
   `AppError` e documentado com JSDoc + bloco `Exemplo de uso` (ASCII). Todos
   devem delegar a um metodo privado `create`, preservando `options?.details` e
   `options?.cause`.
   - `badRequest` (codigo padrao `BAD_REQUEST`, status 400)
   - `unauthorized` (`UNAUTHORIZED`, 401)
   - `forbidden` (`FORBIDDEN`, 403)
   - `notFound` (`NOT_FOUND`, 404)
   - `methodNotAllowed` (`METHOD_NOT_ALLOWED`, 405)
   - `conflict` (`CONFLICT`, 409)
   - `gone` (`GONE`, 410)
   - `preconditionFailed` (`PRECONDITION_FAILED`, 412)
   - `unsupportedMediaType` (`UNSUPPORTED_MEDIA_TYPE`, 415)
   - `unprocessableEntity` (`UNPROCESSABLE_ENTITY`, 422)
   - `tooManyRequests` (`TOO_MANY_REQUESTS`, 429)
   - `internal` (`INTERNAL_SERVER_ERROR`, 500)
   - `notImplemented` (`NOT_IMPLEMENTED`, 501)
   - `badGateway` (`BAD_GATEWAY`, 502)
   - `serviceUnavailable` (`SERVICE_UNAVAILABLE`, 503)
   - `gatewayTimeout` (`GATEWAY_TIMEOUT`, 504)
   - `custom` (recebe `code`, `status`, `message`, `options?` e chama
     `createAppError` diretamente)
8. Adicione o metodo estatico `fromUnknown(error, fallback?)` que use
   `normalizeAppError(error, { code: fallback.code ?? "INTERNAL_SERVER_ERROR", message: fallback.message ?? "Erro inesperado", status: fallback.status ?? 500, details: fallback.details })`.
   Documente com JSDoc e exemplo.
9. Implemente o metodo privado estatico
   `create(defaultCode, status, message, options?)` retornando `createAppError`
   com `code = options?.code ?? defaultCode`, preservando `details` e `cause`.

## Arquivo `src/core/helpers/result.ts`

10. Defina o tipo `Result<T, E>` como uniao de `Success<T, E>` e
    `Failure<T, E>`.
11. Implemente as classes internas `Success<T, E>` e `Failure<T, E>` com
    propriedades `readonly ok` (`true`/`false`) e `value`.
12. Crie a classe `ResultHandler<T, E>` que recebe um `Result<T, E>` no
    construtor e disponibiliza:
    - `isSuccess()` e `isError()` servindo como type guards, com comentarios +
      exemplos.
    - `Value()` retornando `T | E`.
    - `SuccessValue()` retornando `T` (lança erro se estiver em estado de
      falha).
    - `ErrorValue()` retornando `E` (lança erro se estiver em estado de
      sucesso).
    - `unwrap()` retornando o `Result<T, E>` original.
13. Exporte o objeto `result` contendo:
    - `Success<T, E = never>(value: T): ResultHandler<T, E>`
    - `Error<T = never, E = unknown>(value: E): ResultHandler<T, E>`
    - `from<T, E>(state: Result<T, E>): ResultHandler<T, E>` Cada metodo deve
      possuir comentario JSDoc com bloco `Exemplo de uso`.
14. Certifique-se de que todos os comentarios utilizam ASCII e estejam em
    portugues brasileiro.

## Arquivo `src/core/helpers/index.ts`

17. Crie um barrel file exportando todas as funcoes, classes e tipos necessarios
    dos helpers:
    - Exporte nomeadamente `createAppError`, `isAppError`, `normalizeAppError`,
      `AppError`, `AppErrorOptions`, `NormalizeAppErrorOptions`, `ApiErrors`,
      `ApiErrorOptions`, `Result`, `ResultHandler` e `result`.
    - Utilize reexports (ex.: `export { createAppError } from "./errors.ts";` e
      `export type { AppError } from "./errors.ts";`) preservando tipos com
      `export type`.
    - Inclua comentario simples no topo explicando que o arquivo centraliza as
      exportacoes dos helpers.

# Checagem

- Confirme que os arquivos `errors.ts`, `api_errors.ts`, `result.ts` e
  `index.ts` estao presentes em `src/core/helpers` e correspondem exatamente a
  especificacao.
- Valide que todos os comentarios possuem bloco `Exemplo de uso` quando
  aplicavel e utilizam apenas ASCII.
- Garanta que as importacoes sao relativas a `./errors.ts` e nao ha dependencias
  extras.
- Verifique que `index.ts` reexporta corretamente todos os itens previstos
  reunindo o pacote `helpers`.
