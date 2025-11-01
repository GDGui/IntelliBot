# Objetivo

Recriar o cliente HTTP em `src/core/infra/http/http.client.ts` exatamente como
definido.

# Instrucoes

1. Crie o arquivo `src/core/infra/http/http.client.ts` com:
   - Tipos `HttpMethod`, `HttpRequest`, `HttpResponse`, `AuthOptions` e
     interface `HttpClient` retornando `Result<..., AppError>`.
   - Funcoes `createHttpClient` com metodos `request`, `get`, `post`, `put`,
     `patch`, `delete` e `authenticate` baseados em `fetch`.
   - Helpers internos `buildUrl`, `parseBody`, `buildAuthBody`.
   - Use `result.Success`/`result.Error` com `createAppError` para tratar erros.
   - Comentarios JSDoc em portugues (ASCII) com blocos `Exemplo de uso`.
2. Atualize `src/core/index.ts` ou barrel correspondente para exportar o cliente
   HTTP.
3. Certifique-se de que importacoes externas venham de `src/core/index.ts` ou
   `src/deps.ts` conforme padrao.

# Checagem

- Execute `deno check src/core/infra/http/http.client.ts`.
- Confirme que `createHttpClient` oferece autenticacao via `AuthOptions` (type
  `bearer`).
- Verifique que o codigo usa apenas ASCII e segue diretrizes de log/erro do
  projeto.
