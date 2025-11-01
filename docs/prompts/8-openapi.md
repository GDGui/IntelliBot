# Objetivo

Recriar todo o módulo `src/core/openapi/`, garantindo que os middlewares para
Scalar, Swagger e o ponto de orquestração (`openapi.ts`) sejam idênticos ao
estado de referência atual, incluindo a atualização do barrel
`src/core/openapi/index.ts` e a exportação necessária em `src/deps.ts`.

# Instruções

1. **Atualizar dependências compartilhadas**
   - Abrir `src/deps.ts` e garantir que os seguintes exports existam exatamente:

```ts
export { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";
export { apiReference, Scalar } from "npm:@scalar/hono-api-reference@0.9.22";
```

2. **Implementar `src/core/openapi/scalar.ts`**
   - Conteúdo exato que deve ser recriado:

```ts
import { Scalar } from "../../deps.ts";

export interface ScalarDocsOptions {
  title: string;
  specUrl: string;
}

/**
 * Cria middleware Hono para UI Scalar.
 */
export const createScalarDocs = (options: ScalarDocsOptions) =>
  Scalar({
    pageTitle: options.title,
    url: options.specUrl,
  });
```

3. **Implementar `src/core/openapi/swagger.ts`**
   - Conteúdo exato:

```ts
import { swaggerUI } from "../../deps.ts";

export interface SwaggerDocsOptions {
  title: string;
  specUrl: string;
}

/**
 * Cria middleware Hono para Swagger UI.
 */
export const createSwaggerDocs = (options: SwaggerDocsOptions) =>
  swaggerUI({
    url: options.specUrl,
    manuallySwaggerUIHtml: (asset) => `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${options.title}</title>
    ${
      asset.css.map((href) =>
        `<link rel="stylesheet" type="text/css" href="${href}" />`
      ).join("\n    ")
    }
  </head>
  <body>
    <div id="swagger-ui"></div>
    ${
      asset.js.map((src) =>
        `<script src="${src}" crossorigin="anonymous"></script>`
      ).join("\n    ")
    }
    <script>
      window.onload = () => {
        window.ui = SwaggerUIBundle({
          dom_id: "#swagger-ui",
          url: ${JSON.stringify(options.specUrl)},
        });
      };
    </script>
  </body>
</html>
    `,
  });
```

4. **Implementar `src/core/openapi/openapi.ts`**
   - Garantir o código abaixo:

```ts
import type { MiddlewareHandler } from "../../deps.ts";
import { createScalarDocs, type ScalarDocsOptions } from "./scalar.ts";
import { createSwaggerDocs, type SwaggerDocsOptions } from "./swagger.ts";

export interface OpenApiDocsOverrides {
  scalar?: Partial<ScalarDocsOptions>;
  swagger?: Partial<SwaggerDocsOptions>;
}

export interface OpenApiDocsOptions extends OpenApiDocsOverrides {
  title: string;
  specUrl: string;
}

export interface OpenApiDocsMiddleware {
  scalar: MiddlewareHandler;
  swagger: MiddlewareHandler;
}

/**
 * Cria os middlewares de documentação Scalar e Swagger a partir de uma configuração única.
 */
export const createOpenApiDocs = (
  options: OpenApiDocsOptions,
): OpenApiDocsMiddleware => {
  const scalarOptions: ScalarDocsOptions = {
    title: options.scalar?.title ?? options.title,
    specUrl: options.scalar?.specUrl ?? options.specUrl,
  };

  const swaggerOptions: SwaggerDocsOptions = {
    title: options.swagger?.title ?? options.title,
    specUrl: options.swagger?.specUrl ?? options.specUrl,
  };

  return {
    scalar: createScalarDocs(scalarOptions),
    swagger: createSwaggerDocs(swaggerOptions),
  };
};
```

5. **Atualizar barrel de exports**
   - Em `src/core/openapi/index.ts`, garantir que existam as três reexportações:

```ts
export * from "./scalar.ts";
export * from "./swagger.ts";
export * from "./openapi.ts";
```

6. **Formatação e verificação**
   - Executar `deno fmt src/core/openapi/*.ts src/deps.ts`.
   - Executar `deno check src/core/openapi/*.ts`.

# Resultado esperado

Após seguir este prompt, o módulo `src/core/openapi/` deve estar idêntico ao
estado de referência: middlewares consistentes para Scalar e Swagger, um ponto
único de criação (`createOpenApiDocs`) e o barrel atualizado, utilizando apenas
dependências exportadas através de `src/deps.ts`.
