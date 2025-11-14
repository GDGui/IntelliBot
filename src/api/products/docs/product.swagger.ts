/**
 * Swagger UI para modulo Products utilizando core/openapi.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import type { MiddlewareHandler } from "../../../deps.ts";
import { createOpenApiDocs } from "../../../core/openapi/index.ts";

export interface ProductDocsOptions {
  title?: string;
  specUrl?: string;
}

export function createProductsOpenApiDocs(options?: ProductDocsOptions): { swagger: MiddlewareHandler; scalar: MiddlewareHandler } {
  const title = options?.title ?? "Products API";
  const specUrl = options?.specUrl ?? "/openapi.json";
  const middlewares = createOpenApiDocs({ title, specUrl });
  return { swagger: middlewares.swagger, scalar: middlewares.scalar };
}

