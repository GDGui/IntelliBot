/**
 * Repository de Product com integracao Supabase.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { result, createAppError } from "../../core/helpers/index.ts";
import type { Result, AppError } from "../../core/helpers/index.ts";
import { EnvConfigs } from "../../core/infra/index.ts";
import {
  SupabaseClientFactory,
  type SupabaseClientProvider,
  loadSupabaseConfigFromEnv,
} from "../../core/infra/index.ts";
import type { Product, ProductCreateRequest, ProductPatchRequest, ProductUpdateRequest } from "./product.model.ts";

/** Contrato do repositorio de Products. */
export interface IProductsRepository {
  list(): Promise<Result<Product[], AppError>>;
  findById(id: string): Promise<Result<Product | undefined, AppError>>;
  findByName(term: string): Promise<Result<Product[], AppError>>;
  findByCreatedAt(dateIso: string): Promise<Result<Product[], AppError>>;
  findByQuery(column: string, value: unknown): Promise<Result<Product[], AppError>>;
  create(input: ProductCreateRequest): Promise<Result<Product, AppError>>;
  update(input: ProductUpdateRequest): Promise<Result<Product, AppError>>;
  patch(input: ProductPatchRequest): Promise<Result<Product, AppError>>;
  deactivate(id: string): Promise<Result<Product, AppError>>;
}

/** Implementacao baseada em Supabase. */
export class ProductsRepository implements IProductsRepository {
  private readonly table = "products";
  private readonly provider: SupabaseClientProvider;

  constructor(provider?: SupabaseClientProvider) {
    // Garante carregamento de .env local quando aplicavel
    new EnvConfigs();
    this.provider = provider ?? new SupabaseClientFactory(loadSupabaseConfigFromEnv());
  }

  async list(): Promise<Result<Product[], AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { data, error } = await supabase.from(this.table)
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return result.Success<Product[], AppError>((data ?? []) as Product[]).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_LIST_ERROR", "Falha ao listar products", e);
    }
  }

  async findById(id: string): Promise<Result<Product | undefined, AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { data, error } = await supabase.from(this.table)
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return result.Success<Product | undefined, AppError>(data as Product | undefined).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_FIND_BY_ID_ERROR", "Falha ao buscar product por id", e);
    }
  }

  async findByName(term: string): Promise<Result<Product[], AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { data, error } = await supabase.from(this.table)
        .select("*")
        .ilike("title", `%${term}%`);
      if (error) throw error;
      return result.Success<Product[], AppError>((data ?? []) as Product[]).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_FIND_BY_NAME_ERROR", "Falha ao buscar products por nome", e);
    }
  }

  async findByCreatedAt(dateIso: string): Promise<Result<Product[], AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { data, error } = await supabase.from(this.table)
        .select("*")
        .gte("created_at", dateIso)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return result.Success<Product[], AppError>((data ?? []) as Product[]).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_FIND_BY_CREATED_AT_ERROR", "Falha ao buscar products por created_at", e);
    }
  }

  async findByQuery(column: string, value: unknown): Promise<Result<Product[], AppError>> {
    try {
      const supabase = this.provider.getClient();
      // Para simplificar, usa eq() por padrao; casos especiais podem ser tratados no service
      const { data, error } = await supabase.from(this.table)
        .select("*")
        .eq(column, value as never);
      if (error) throw error;
      return result.Success<Product[], AppError>((data ?? []) as Product[]).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_FIND_BY_QUERY_ERROR", "Falha ao filtrar products por coluna/valor", e, { column, value });
    }
  }

  async create(input: ProductCreateRequest): Promise<Result<Product, AppError>> {
    try {
      const supabase = this.provider.getClient();
      const payload = { ...input, active: input.active ?? true };
      const { data, error } = await supabase.from(this.table)
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;
      return result.Success<Product, AppError>(data as Product).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_CREATE_ERROR", "Falha ao criar product", e, { input });
    }
  }

  async update(input: ProductUpdateRequest): Promise<Result<Product, AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { id, ...update } = input;
      const { data, error } = await supabase.from(this.table)
        .update(update)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return result.Success<Product, AppError>(data as Product).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_UPDATE_ERROR", "Falha ao atualizar product", e, { input });
    }
  }

  async patch(input: ProductPatchRequest): Promise<Result<Product, AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { id, ...update } = input;
      const { data, error } = await supabase.from(this.table)
        .update(update)
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return result.Success<Product, AppError>(data as Product).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_PATCH_ERROR", "Falha ao alterar parcialmente product", e, { input });
    }
  }

  async deactivate(id: string): Promise<Result<Product, AppError>> {
    try {
      const supabase = this.provider.getClient();
      const { data, error } = await supabase.from(this.table)
        .update({ active: false })
        .eq("id", id)
        .select("*")
        .single();
      if (error) throw error;
      return result.Success<Product, AppError>(data as Product).unwrap();
    } catch (e) {
      return this.sbError("PRODUCTS_DEACTIVATE_ERROR", "Falha ao desativar product", e, { id });
    }
  }

  private sbError<T>(code: string, message: string, cause: unknown, details?: unknown): Result<T, AppError> {
    return result.Error<T, AppError>(createAppError(code, message, { cause, details })).unwrap();
  }
}
