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
