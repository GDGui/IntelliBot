# Plano de Desenvolvimento: Módulo HTTP Client

Este documento detalha o plano de desenvolvimento para o módulo de cliente HTTP, conforme solicitado no prompt `6-http.md`.

## 1. Criação do Cliente HTTP (`http.client.ts`)

- **Local:** `src/core/infra/http/http.client.ts`
- **Tipos e Interfaces:** Definir os tipos (`HttpMethod`, `HttpRequest`, `HttpResponse`, `AuthOptions`) e a interface `HttpClient`.
- **Implementação:** Criar a função `createHttpClient` que retorna um cliente HTTP completo, com métodos para `request`, `get`, `post`, `put`, `patch`, `delete` e `authenticate`.
- **Base:** A implementação utilizará a API `fetch` nativa.
- **Helpers:** Desenvolver funções auxiliares internas para construção de URLs, parsing de body e autenticação.
- **Error Handling:** O tratamento de erros será feito com o `Result Monad` (`result.Success`/`result.Error`) e `createAppError`.
- **Documentação:** Todo o código será documentado com JSDoc em português (sem acentos).

## 2. Exportação do Módulo

- Criar os arquivos `index.ts` necessários (`src/core/infra/http/index.ts` e `src/core/infra/index.ts`) para que o `HttpClient` seja devidamente exportado pelo `src/core/index.ts`, seguindo o padrão de "barrel exports" do projeto.

## 3. Padrões e Qualidade

- O código seguirá todos os padrões de qualidade e estilo já estabelecidos no projeto.
- Ao final, executarei `deno check` (ou farei uma revisão manual detalhada) para garantir a correção dos tipos.
