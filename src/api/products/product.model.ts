/**
 * Modelos e mappers para entidade Product.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { JsonUtil } from "../../core/index.ts";

/** Entidade anemica Product. */
export interface Product {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_url: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/** Request/Response genericos para handlers. */
export interface ProductCreateRequest {
  title: string;
  description: string;
  price_cents: number;
  image_url: string;
  active?: boolean;
}

export interface ProductUpdateRequest {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_url: string;
  active: boolean;
}

export type ProductPatchRequest = Partial<Omit<ProductUpdateRequest, "id">> & {
  id: string;
};

/**
 * Model com utilitarios de validacao/mapeamento para Product.
 *
 * Exemplo de uso:
 * ```ts
 * const ok = ProductModel.fromJson('{"title":"x", "price_cents": 100}');
 * if (ok.ok) console.log(ok.value);
 * ```
 */
export class ProductModel {
  /** Valida estrutura minima de criacao. */
  static validateCreate(input: ProductCreateRequest): string[] {
    const errors: string[] = [];
    if (!input.title || input.title.trim().length === 0) errors.push("title obrigatorio");
    if (typeof input.price_cents !== "number" || Number.isNaN(input.price_cents)) errors.push("price_cents invalido");
    if (!input.image_url || input.image_url.trim().length === 0) errors.push("image_url obrigatorio");
    return errors;
  }

  /** Serializa um objeto qualquer para JSON string. */
  static toJson(value: unknown) {
    return JsonUtil.serialize(value, { space: 2 });
  }

  /** Desserializa JSON string para um tipo generico. */
  static fromJson<T = unknown>(text: string) {
    return JsonUtil.deserialize<T>(text);
  }

  /** Cria entidade a partir de objeto plano. */
  static toEntity(obj: Record<string, unknown>): Product {
    return {
      id: String(obj.id ?? ""),
      title: String(obj.title ?? ""),
      description: String(obj.description ?? ""),
      price_cents: Number(obj.price_cents ?? 0),
      image_url: String(obj.image_url ?? ""),
      active: Boolean(obj.active ?? true),
      created_at: String(obj.created_at ?? new Date().toISOString()),
      updated_at: String(obj.updated_at ?? new Date().toISOString()),
    } satisfies Product;
  }

  /** Converte entidade em objeto plano (para persistencia/retorno). */
  static fromEntity(p: Product): Record<string, unknown> {
    return { ...p };
  }

  /** Copia a entidade com sobrescritas opcionais. */
  static copyWith(p: Product, patch: Partial<Product>): Product {
    return { ...p, ...patch, updated_at: new Date().toISOString() };
  }
}

