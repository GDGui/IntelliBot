/**
 * Fabrica e helpers para cliente Supabase.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { createClient, type SupabaseClient, nodeProcess } from "../../../deps.ts";
import type { SupabaseConfig } from "./supabase_config.ts";

// Nomes padroes de variaveis de ambiente
export const ENV_SUPABASE_URL = "SUPABASE_URL" as const;
export const ENV_SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY" as const;
export const ENV_SUPABASE_SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY" as const;

/**
 * Provider de cliente Supabase.
 *
 * Exemplo de uso:
 * ```ts
 * const provider: SupabaseClientProvider = new SupabaseClientFactory({ url, anonKey });
 * const client = provider.getClient();
 * const provider2 = provider.withConfig({ serviceRoleKey: "srv" });
 * ```
 */
export interface SupabaseClientProvider {
  getClient(): SupabaseClient;
  withConfig(config: Partial<SupabaseConfig>): SupabaseClientProvider;
}

/**
 * Le configuracao a partir de variaveis de ambiente.
 * Valida URL e ao menos uma chave. Lanca Error (ASCII) quando invalido.
 *
 * Exemplo de uso:
 * ```ts
 * const cfg = loadSupabaseConfigFromEnv();
 * const factory = new SupabaseClientFactory(cfg);
 * ```
 */
export function loadSupabaseConfigFromEnv(): SupabaseConfig {
  const url = readEnv(ENV_SUPABASE_URL);
  const anonKey = readEnv(ENV_SUPABASE_ANON_KEY);
  const serviceRoleKey = readEnv(ENV_SUPABASE_SERVICE_ROLE_KEY);

  if (!url) throw new Error("SUPABASE_URL is required");
  if (!anonKey && !serviceRoleKey) throw new Error("At least one key is required: SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY");

  return { url, anonKey: anonKey ?? undefined, serviceRoleKey: serviceRoleKey ?? undefined };
}

/**
 * Fabrica de cliente Supabase com cache interno.
 *
 * Exemplo de uso:
 * ```ts
 * const factory = new SupabaseClientFactory({ url, anonKey });
 * const client = factory.getClient();
 * const serviceFactory = factory.withConfig({ serviceRoleKey: "srv" });
 * ```
 */
export class SupabaseClientFactory implements SupabaseClientProvider {
  private cache?: SupabaseClient;

  constructor(private readonly config: SupabaseConfig) {}

  getClient(): SupabaseClient {
    if (this.cache) return this.cache;
    const key = selectAccessKey(this.config);
    const client = createClient(this.config.url, key, {
      auth: { persistSession: false, detectSessionInUrl: false },
    });
    this.cache = client;
    return client;
  }

  withConfig(config: Partial<SupabaseConfig>): SupabaseClientFactory {
    return new SupabaseClientFactory({ ...this.config, ...config });
  }
}

/** Seleciona a chave de acesso (service role preferivel). */
export function selectAccessKey(cfg: SupabaseConfig): string {
  if (cfg.serviceRoleKey && cfg.serviceRoleKey.length > 0) return cfg.serviceRoleKey;
  if (cfg.anonKey && cfg.anonKey.length > 0) return cfg.anonKey;
  throw new Error("Supabase access key not provided");
}

/** Le variavel de ambiente de Deno.env ou nodeProcess.env. */
export function readEnv(name: string): string | undefined {
  try {
    // Deno.env.get pode nao estar disponivel em alguns ambientes
    // @ts-ignore Deno global pode existir em tempo de execucao
    if (typeof Deno !== "undefined" && Deno?.env?.get) {
      const v = Deno.env.get(name);
      if (v !== undefined) return v;
    }
  } catch { /* ignore */ }
  try {
    const v = nodeProcess?.env?.[name];
    if (typeof v === "string") return v;
  } catch { /* ignore */ }
  return undefined;
}

