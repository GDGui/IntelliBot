/**
 * Handler HTTP (Hono) para Products.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { Hono, type Context } from "../../deps.ts";
import { result, ApiErrors } from "../../core/helpers/index.ts";
import type { Result, AppError } from "../../core/helpers/index.ts";
import type { IProductsService } from "./product.service.ts";
import type { Product, ProductCreateRequest, ProductPatchRequest, ProductUpdateRequest } from "./product.model.ts";

/** Contrato do handler. */
export interface IProductsHandler {
  register(app: Hono): void;
}

/** Implementacao do handler. */
export class ProductsHandler implements IProductsHandler {
  constructor(private readonly service: IProductsService) {}

  register(app: Hono): void {
    // List
    app.get("/", (c) => this.wrap(c, () => this.service.list()));

    // Create
    app.post("/", (c) => this.wrap(c, async () => {
      const body = await c.req.json().catch(() => ({}));
      return this.service.create(body as ProductCreateRequest);
    }));

    // Update (PUT)
    app.put("/:id", (c) => this.wrap(c, async () => {
      const id = c.req.param("id");
      const body = await c.req.json().catch(() => ({}));
      return this.service.update({ id, ...(body as Omit<ProductUpdateRequest, "id">) } as ProductUpdateRequest);
    }));

    // Patch
    app.patch("/:id", (c) => this.wrap(c, async () => {
      const id = c.req.param("id");
      const body = await c.req.json().catch(() => ({}));
      return this.service.patch({ id, ...(body as Omit<ProductPatchRequest, "id">) } as ProductPatchRequest);
    }));

    // Delete -> desativacao logica
    app.delete("/:id", (c) => this.wrap(c, () => {
      const id = c.req.param("id");
      return this.service.deactivate(id);
    }));

    // getByName
    app.get("/search/by-name", (c) => this.wrap(c, () => {
      const q = c.req.query("q") ?? "";
      return this.service.getByName(q);
    }));

    // getByCreatedAt
    app.get("/search/by-created-at", (c) => this.wrap(c, () => {
      const date = c.req.query("date") ?? new Date(0).toISOString();
      return this.service.getByCreatedAt(date);
    }));

    // getByQuery
    app.get("/search/by-query", (c) => this.wrap(c, () => {
      const column = c.req.query("column");
      const value = c.req.query("value");
      if (!column) {
        return Promise.resolve(
          result.Error<Product[], AppError>(
            ApiErrors.badRequest("Param column e obrigatorio"),
          ).unwrap(),
        );
      }
      return this.service.getByQuery(column, value);
    }));

    // getById (depois das rotas /search para evitar colisao de rota)
    app.get("/:id", (c) => this.wrap(c, () => {
      const id = c.req.param("id");
      return this.service.getById(id);
    }));
  }

  /**
   * Wrapper padrao: converte Result em HTTP response.
   */
  private async wrap<T>(c: Context, fn: () => Promise<Result<T, AppError>>): Promise<Response> {
    try {
      const r = await fn();
      const okFlag = (r as unknown as { ok: boolean }).ok === true;
      if (okFlag) {
        const data = (r as unknown as { value: T }).value;
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      const err = (r as unknown as { value: AppError }).value;
      const status = err.status ?? 400;
      return new Response(JSON.stringify({ error: err }), {
        status,
        headers: { "content-type": "application/json" },
      });
    } catch (e) {
      const err = ApiErrors.fromUnknown(e);
      return new Response(JSON.stringify({ error: err }), {
        status: err.status ?? 500,
        headers: { "content-type": "application/json" },
      });
    }
  }
}
