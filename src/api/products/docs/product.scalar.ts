/**
 * Scalar UI para modulo Products.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import type { MiddlewareHandler } from "../../../deps.ts";
import { createOpenApiDocs } from "../../../core/openapi/index.ts";

export function createProductsScalar(): MiddlewareHandler {
  return createOpenApiDocs({ title: "Products API", specUrl: "/openapi.json" }).scalar;
}

