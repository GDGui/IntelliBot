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
