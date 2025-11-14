/**
 * Configs: acesso a variaveis de ambiente (.env local ou secrets remotas).
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { loadSync, existsSync, nodeProcess } from "../../../deps.ts";
import { createAppError, result } from "../../helpers/index.ts";
import type { AppError, Result } from "../../helpers/index.ts";

/** Opcoes da implementacao de configs. */
export interface ConfigsOptions {
  envPath?: string; // caminho do .env (default: .env)
  exportToEnv?: boolean; // exporta chaves do .env para Deno.env (default: true)
}

/** Interface publica para leitura de configs. */
export interface ConfigsProvider {
  isLocal(): boolean;
  get(name: string): Result<string, AppError>;
  getOptional(name: string): Result<string | undefined, AppError>;
  getNumber(name: string, opts?: { integer?: boolean }): Result<number, AppError>;
  getBoolean(name: string): Result<boolean, AppError>;
  asRecord(): Result<Record<string, string>, AppError>;
}

/** Implementacao baseada em Deno.env / process.env e .env local. */
export class EnvConfigs implements ConfigsProvider {
  private readonly options: Required<Pick<ConfigsOptions, "envPath" | "exportToEnv">>;
  private readonly localMode: boolean;
  private loaded = false;
  private cache: Record<string, string> = {};

  constructor(options?: ConfigsOptions) {
    this.options = {
      envPath: options?.envPath ?? ".env",
      exportToEnv: options?.exportToEnv ?? true,
    };
    this.localMode = detectLocalMode(this.options.envPath);
    // Carrega .env no construtor quando local
    this.tryLoadEnv();
  }

  isLocal(): boolean {
    return this.localMode;
  }

  get(name: string): Result<string, AppError> {
    this.tryLoadEnv();
    const v = readEnv(name);
    if (typeof v === "string" && v.length > 0) {
      return result.Success<string, AppError>(v).unwrap();
    }
    return result.Error<string, AppError>(
      createAppError("CONFIG_VAR_REQUIRED", `Variavel de ambiente obrigatoria ausente: ${name}`, {
        details: { name, mode: this.localMode ? "local" : "remote" },
      }),
    ).unwrap();
  }

  getOptional(name: string): Result<string | undefined, AppError> {
    this.tryLoadEnv();
    const v = readEnv(name);
    return result.Success<string | undefined, AppError>(v).unwrap();
  }

  getNumber(name: string, opts?: { integer?: boolean }): Result<number, AppError> {
    const rv = this.get(name);
    if (!rv.ok) return result.Error<number, AppError>(rv.value).unwrap();
    const n = Number(rv.value);
    if (Number.isNaN(n)) {
      return result.Error<number, AppError>(
        createAppError("CONFIG_VAR_PARSE_NUMBER_ERROR", `Nao foi possivel converter para numero: ${name}`, {
          details: { name, value: rv.value },
        }),
      ).unwrap();
    }
    if (opts?.integer && !Number.isInteger(n)) {
      return result.Error<number, AppError>(
        createAppError("CONFIG_VAR_NOT_INTEGER", `Valor nao e inteiro: ${name}`, {
          details: { name, value: rv.value },
        }),
      ).unwrap();
    }
    return result.Success<number, AppError>(n).unwrap();
  }

  getBoolean(name: string): Result<boolean, AppError> {
    const rv = this.get(name);
    if (!rv.ok) return result.Error<boolean, AppError>(rv.value).unwrap();
    const v = rv.value.trim().toLowerCase();
    const truthy = ["true", "1", "yes", "y", "on"]; 
    const falsy = ["false", "0", "no", "n", "off"]; 
    if (truthy.includes(v)) return result.Success<boolean, AppError>(true).unwrap();
    if (falsy.includes(v)) return result.Success<boolean, AppError>(false).unwrap();
    return result.Error<boolean, AppError>(
      createAppError("CONFIG_VAR_PARSE_BOOLEAN_ERROR", `Nao foi possivel converter para boolean: ${name}`, {
        details: { name, value: rv.value },
      }),
    ).unwrap();
  }

  asRecord(): Result<Record<string, string>, AppError> {
    this.tryLoadEnv();
    try {
      // Combina Deno.env + process.env em um Record<string,string>
      const out: Record<string, string> = {};
      // @ts-ignore Deno pode existir em runtime
      if (typeof Deno !== "undefined" && Deno?.env) {
        try {
          // Deno.env.toObject existe em Deno >= 1.38
          // @ts-ignore
          const obj = Deno.env.toObject?.() as Record<string, string> | undefined;
          if (obj) Object.assign(out, obj);
        } catch { /* ignore */ }
      }
      try {
        Object.entries(nodeProcess?.env ?? {}).forEach(([k, v]) => {
          if (typeof v === "string") out[k] = v;
        });
      } catch { /* ignore */ }
      // Cache local do .env (caso carregado) tem precedencia
      Object.assign(out, this.cache);
      return result.Success<Record<string, string>, AppError>(out).unwrap();
    } catch (e) {
      return result.Error<Record<string, string>, AppError>(
        createAppError("CONFIG_AS_RECORD_ERROR", "Falha ao consolidar variaveis de ambiente", { cause: e }),
      ).unwrap();
    }
  }

  /** Carrega .env quando em modo local, com export opcional para Deno.env. */
  private tryLoadEnv(): void {
    if (!this.localMode || this.loaded) return;
    try {
      if (!existsSync(this.options.envPath)) {
        this.loaded = true; // evita tentativa repetitiva
        return;
      }
      const parsed = loadSync({ envPath: this.options.envPath, export: this.options.exportToEnv });
      this.cache = { ...parsed } as Record<string, string>;
      this.loaded = true;
    } catch (e) {
      // Marca como carregado para evitar retry infinito; acesso individual ainda funciona via readEnv
      this.loaded = true;
      // Nao lanca; metodos publicos retornam Result de erro quando aplicavel
      result.from(
        result.Error<void, AppError>(
          createAppError("CONFIG_LOAD_ENV_ERROR", "Falha ao carregar arquivo .env", {
            cause: e,
            details: { envPath: this.options.envPath },
          }),
        ).unwrap(),
      );
    }
  }
}

/** Detecta se executa localmente com base em envs e presenca de .env. */
function detectLocalMode(envPath: string): boolean {
  const hint = (readEnv("RUNTIME_ENV") ?? readEnv("NODE_ENV") ?? readEnv("LOGGER_ENV"))?.toLowerCase();
  if (hint && ["local", "development", "test"].includes(hint)) return true;
  // Indicadores de ambiente remoto (Deploy/Edge)
  if (readEnv("DENO_DEPLOYMENT_ID") || readEnv("DENO_REGION")) return false;
  // Presenca de .env sugere execucao local
  if (existsSync(envPath)) return true;
  // Fallback
  return false;
}

/** Le variavel de ambiente de Deno.env ou process.env. */
function readEnv(name: string): string | undefined {
  try {
    // @ts-ignore Deno global pode existir em runtime
    if (typeof Deno !== "undefined" && Deno?.env?.get) {
      const v = Deno.env.get(name);
      if (typeof v === "string") return v;
    }
  } catch { /* ignore */ }
  try {
    const v = nodeProcess?.env?.[name];
    if (typeof v === "string") return v;
  } catch { /* ignore */ }
  return undefined;
}

