/**
 * Helper de serializacao/desserializacao JSON para Deno.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { createAppError, result } from "../helpers/index.ts";
import type { AppError, Result } from "../helpers/index.ts";
import { existsSync } from "../../deps.ts";

/** Primitivos JSON. */
export type JsonPrimitive = string | number | boolean | null;

/** Valor JSON valido. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;

/** Objeto JSON generico. */
export type JsonObject = { [key: string]: JsonValue };

/** Array JSON generico. */
export type JsonArray = JsonValue[];

/** Opcoes para serializacao. */
export interface SerializeOptions {
  replacer?: ((this: unknown, key: string, value: unknown) => unknown) | Array<number | string>;
  space?: number | string;
}

/** Opcoes para desserializacao. */
export interface DeserializeOptions {
  reviver?: (this: unknown, key: string, value: unknown) => unknown;
}

/**
 * Classe utilitaria para trabalhar com JSON de forma segura (Result).
 *
 * Exemplo de uso:
 * ```ts
 * const s = JsonUtil.serialize({ x: 1 });
 * if (s.ok) console.log(s.value); // string JSON
 *
 * const p = JsonUtil.deserialize<{ x: number }>(s.ok ? s.value : "{}");
 * if (p.ok) console.log(p.value.x);
 *
 * const read = await JsonUtil.readJsonFile<{ id: string }>("assets/mocks/product.json");
 * if (read.ok) console.log(read.value.id);
 *
 * await JsonUtil.writeJsonFile("/tmp/out.json", { hello: "world" }, { space: 2 });
 * ```
 */
export class JsonUtil {
  /** Serializa um valor para string JSON. */
  static serialize(input: unknown, options?: SerializeOptions): Result<string, AppError> {
    try {
      const out = JSON.stringify(input, options?.replacer as never, options?.space as never);
      if (typeof out !== "string") {
        return result.Error<string, AppError>(
          createAppError("JSON_STRINGIFY_ERROR", "Falha ao serializar para JSON", {
            details: { reason: "Resultado nao e string" },
          }),
        ).unwrap();
      }
      return result.Success<string, AppError>(out).unwrap();
    } catch (e) {
      return result.Error<string, AppError>(
        createAppError("JSON_STRINGIFY_ERROR", "Falha ao serializar para JSON", { cause: e }),
      ).unwrap();
    }
  }

  /** Desserializa uma string JSON em um tipo T. */
  static deserialize<T = unknown>(text: string, options?: DeserializeOptions): Result<T, AppError> {
    try {
      const value = JSON.parse(text, options?.reviver as never) as T;
      return result.Success<T, AppError>(value).unwrap();
    } catch (e) {
      return result.Error<T, AppError>(
        createAppError("JSON_PARSE_ERROR", "Falha ao desserializar JSON", {
          cause: e,
          details: { preview: previewText(text) },
        }),
      ).unwrap();
    }
  }

  /**
   * Lê um arquivo de texto e parseia como JSON.
   * Requer permissao --allow-read.
   */
  static async readJsonFile<T = unknown>(filePath: string, options?: DeserializeOptions): Promise<Result<T, AppError>> {
    try {
      if (!existsSync(filePath)) {
        return result.Error<T, AppError>(
          createAppError("JSON_FILE_NOT_FOUND", "Arquivo JSON nao encontrado", { details: { path: filePath } }),
        ).unwrap();
      }
      const text = await Deno.readTextFile(filePath);
      return this.deserialize<T>(text, options);
    } catch (e) {
      return result.Error<T, AppError>(
        createAppError("JSON_FILE_READ_ERROR", "Falha ao ler arquivo JSON", {
          cause: e,
          details: { path: filePath },
        }),
      ).unwrap();
    }
  }

  /**
   * Serializa e grava um valor em arquivo .json (texto).
   * Requer permissao --allow-write.
   */
  static async writeJsonFile(
    filePath: string,
    data: unknown,
    options?: SerializeOptions,
  ): Promise<Result<void, AppError>> {
    const s = this.serialize(data, options);
    if (!s.ok) return result.Error<void, AppError>(s.value).unwrap();
    try {
      await Deno.writeTextFile(filePath, s.value as string);
      return result.Success<void, AppError>(undefined as void).unwrap();
    } catch (e) {
      return result.Error<void, AppError>(
        createAppError("JSON_FILE_WRITE_ERROR", "Falha ao escrever arquivo JSON", {
          cause: e,
          details: { path: filePath },
        }),
      ).unwrap();
    }
  }
}

/** Retorna um preview curto da string para mensagem de erro. */
function previewText(text: string, max = 120): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  return trimmed.length <= max ? trimmed : `${trimmed.slice(0, max)}...`;
}
