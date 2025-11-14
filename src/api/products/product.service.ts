/**
 * Service de Product, aplicando regras simples e orquestrando o repositorio.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { result, createAppError } from "../../core/helpers/index.ts";
import type { Result, AppError } from "../../core/helpers/index.ts";
import type { Product, ProductCreateRequest, ProductPatchRequest, ProductUpdateRequest } from "./product.model.ts";
import type { IProductsRepository } from "./product.repository.ts";
import { ProductModel } from "./product.model.ts";

/** Contrato do servico de Product. */
export interface IProductsService {
  list(): Promise<Result<Product[], AppError>>;
  getById(id: string): Promise<Result<Product, AppError>>;
  getByName(term: string): Promise<Result<Product[], AppError>>;
  getByCreatedAt(dateIso: string): Promise<Result<Product[], AppError>>;
  getByQuery(column: string, value: unknown): Promise<Result<Product[], AppError>>;
  create(input: ProductCreateRequest): Promise<Result<Product, AppError>>;
  update(input: ProductUpdateRequest): Promise<Result<Product, AppError>>;
  patch(input: ProductPatchRequest): Promise<Result<Product, AppError>>;
  deactivate(id: string): Promise<Result<Product, AppError>>;
}

/** Implementacao do servico. */
export class ProductsService implements IProductsService {
  constructor(private readonly repo: IProductsRepository) {}

  list() { return this.repo.list(); }

  async getById(id: string): Promise<Result<Product, AppError>> {
    const r = await this.repo.findById(id);
    if (!r.ok) return result.Error<Product, AppError>(r.value).unwrap();
    if (!r.value) {
      return result.Error<Product, AppError>(createAppError("PRODUCT_NOT_FOUND", "Produto nao encontrado", { details: { id } })).unwrap();
    }
    return result.Success<Product, AppError>(r.value).unwrap();
  }

  getByName(term: string) { return this.repo.findByName(term); }
  getByCreatedAt(dateIso: string) { return this.repo.findByCreatedAt(dateIso); }
  getByQuery(column: string, value: unknown) { return this.repo.findByQuery(column, value); }

  async create(input: ProductCreateRequest): Promise<Result<Product, AppError>> {
    const errors = ProductModel.validateCreate(input);
    if (errors.length > 0) {
      return result.Error<Product, AppError>(
        createAppError("PRODUCT_VALIDATION_ERROR", "Dados invalidos para criacao", { details: { errors } }),
      ).unwrap();
    }
    return await this.repo.create(input);
  }

  update(input: ProductUpdateRequest) { return this.repo.update(input); }
  patch(input: ProductPatchRequest) { return this.repo.patch(input); }
  deactivate(id: string) { return this.repo.deactivate(id); }
}
