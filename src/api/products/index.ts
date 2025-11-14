/**
 * Ponto de entrada do modulo Products.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { Hono } from "../../deps.ts";
import { createLoggerMiddleware } from "../../core/index.ts";
import { createAppError } from "../../core/helpers/index.ts";
import { ProductsRepository } from "./product.repository.ts";
import { ProductsService } from "./product.service.ts";
import { ProductsHandler } from "./product.handler.ts";
import { createProductsOpenApiDocs } from "./docs/product.swagger.ts";

// Barrel exports
export * from "./product.model.ts";
export * from "./product.repository.ts";
export * from "./product.service.ts";
export * from "./product.handler.ts";

/** Cria app Hono com middlewares, docs e rotas do modulo. */
export function createProductsApp(): Hono {
  const app = new Hono();
  app.use("*", createLoggerMiddleware());

  // OpenAPI UIs (Swagger/Scalar)
  const docs = createProductsOpenApiDocs();
  app.get("/swagger", docs.swagger);
  app.get("/scalar", docs.scalar);

  // OpenAPI spec basico para o modulo
  app.get("/openapi.json", (c) => c.json(createOpenApiSpec()));

  // Collection (JSON estatico do modulo)
  app.get("/collection", async (c) => {
    try {
      const text = await Deno.readTextFile("src/api/products/docs/product.collection.json");
      return new Response(text, {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    } catch (e) {
      const err = createAppError("PRODUCTS_COLLECTION_ERROR", "Falha ao carregar collection", { cause: e });
      return new Response(JSON.stringify({ error: err }), {
        status: err.status ?? 500,
        headers: { "content-type": "application/json" },
      });
    }
  });

  // Rotas do modulo
  const repo = new ProductsRepository();
  const service = new ProductsService(repo);
  const handler = new ProductsHandler(service);
  handler.register(app);

  return app;
}

/** Exporta handler fetch para uso em Edge Functions do Supabase. */
export function productsFetch(req: Request): Response | Promise<Response> {
  const app = createProductsApp();
  return app.fetch(req);
}

/** OpenAPI spec minimalista para Products. */
function createOpenApiSpec() {
  return {
    openapi: "3.0.0",
    info: { title: "Products API", version: "1.0.0" },
    paths: {
      "/": {
        get: { summary: "Lista products", responses: { 200: { description: "OK" } } },
        post: { summary: "Cria product", responses: { 200: { description: "OK" } } },
      },
      "/{id}": {
        get: { summary: "Busca por id", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" }, 404: { description: "Nao encontrado" } } },
        put: { summary: "Atualiza product (PUT)", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
        patch: { summary: "Atualiza parcialmente (PATCH)", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
        delete: { summary: "Desativa product", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
      },
      "/search/by-name": {
        get: { summary: "Busca por nome", parameters: [{ name: "q", in: "query", required: false }], responses: { 200: { description: "OK" } } },
      },
      "/search/by-created-at": {
        get: { summary: "Busca por created_at", parameters: [{ name: "date", in: "query", required: true }], responses: { 200: { description: "OK" } } },
      },
      "/search/by-query": {
        get: { summary: "Busca generica por coluna/valor", parameters: [
          { name: "column", in: "query", required: true },
          { name: "value", in: "query", required: false }
        ], responses: { 200: { description: "OK" } } },
      },
      "/swagger": { get: { summary: "Swagger UI", responses: { 200: { description: "OK" } } } },
      "/scalar": { get: { summary: "Scalar UI", responses: { 200: { description: "OK" } } } },
      "/collection": { get: { summary: "Collection JSON", responses: { 200: { description: "OK" } } } },
    },
  } as const;
}
