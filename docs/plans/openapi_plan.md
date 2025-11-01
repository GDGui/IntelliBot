# Plano de Desenvolvimento: Módulo OpenAPI

Este documento detalha o plano de desenvolvimento para o módulo OpenAPI, conforme solicitado no prompt `8-openapi.md`.

## 1. Dependências (`deps.ts`)

- **Tarefa:** Adicionar as exportações para `@hono/swagger-ui` e `@scalar/hono-api-reference` no arquivo `src/deps.ts`.

## 2. Middleware Scalar (`scalar.ts`)

- **Local:** `src/core/openapi/scalar.ts`
- **Tarefa:** Implementar a função `createScalarDocs` para gerar a UI de documentação do Scalar.

## 3. Middleware Swagger (`swagger.ts`)

- **Local:** `src/core/openapi/swagger.ts`
- **Tarefa:** Implementar a função `createSwaggerDocs` para gerar a Swagger UI.

## 4. Orquestrador OpenAPI (`openapi.ts`)

- **Local:** `src/core/openapi/openapi.ts`
- **Tarefa:** Criar a função `createOpenApiDocs`, que servirá como um ponto de entrada único para gerar ambos os middlewares de documentação (Scalar e Swagger) a partir de uma configuração unificada.

## 5. Barrel Exports (`index.ts`)

- **Local:** `src/core/openapi/index.ts`
- **Tarefa:** Criar um arquivo `index.ts` para centralizar e reexportar todas as funcionalidades do módulo OpenAPI.

## 6. Integração (`core/index.ts`)

- **Tarefa:** Atualizar o arquivo `src/core/index.ts` para exportar também o novo módulo OpenAPI.

## 7. Formatação e Verificação

- Ao final, executarei `deno fmt` e `deno check` (ou farei uma revisão manual detalhada) para garantir a qualidade e a correção do código.
