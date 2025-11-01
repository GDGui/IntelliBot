// src/core/infra/supabase/supabase_client.ts

import {
  createClient,
  SupabaseClient,
  nodeProcess,
} from "../../../deps.ts";
import { SupabaseConfig } from "./supabase_config.ts";

// Constantes
const SUPABASE_URL = "SUPABASE_URL";
const SUPABASE_ANON_KEY = "SUPABASE_ANON_KEY";
const SUPABASE_SERVICE_ROLE_KEY = "SUPABASE_SERVICE_ROLE_KEY";

// Helpers

/**
 * @function readEnv
 * @description Le uma variavel de ambiente do Deno ou Node.
 * @param {string} key - A chave da variavel de ambiente.
 * @returns {string | undefined} - O valor da variavel de ambiente.
 */
function readEnv(key: string): string | undefined {
  // @ts-ignore: Deno.env is available in Deno
  if (globalThis.Deno?.env) {
    // @ts-ignore: Deno.env is available in Deno
    return globalThis.Deno.env.get(key);
  }
  return nodeProcess.env[key];
}

/**
 * @function selectAccessKey
 * @description Seleciona a chave de acesso a ser usada.
 * @param {SupabaseConfig} config - A configuracao do Supabase.
 * @returns {string} - A chave de acesso.
 */
function selectAccessKey(config: SupabaseConfig): string {
  const key = config.serviceRoleKey || config.anonKey;
  if (!key) {
    throw new Error("Supabase config must have either an anonKey or a serviceRoleKey");
  }
  return key;
}

// Interface

/**
 * @interface SupabaseClientProvider
 * @description Provedor de cliente Supabase.
 * 
 * @example
 * const factory = new SupabaseClientFactory();
 * const provider: SupabaseClientProvider = factory.withConfig(config);
 * const client = provider.getClient();
 */
export interface SupabaseClientProvider {
  getClient(): SupabaseClient;
  withConfig(config: Partial<SupabaseConfig>): SupabaseClientProvider;
}

// Funcoes

/**
 * @function loadSupabaseConfigFromEnv
 * @description Carrega a configuracao do Supabase a partir das variaveis de ambiente.
 * @returns {SupabaseConfig} - A configuracao do Supabase.
 * 
 * @example
 * const config = loadSupabaseConfigFromEnv();
 */
export function loadSupabaseConfigFromEnv(): SupabaseConfig {
  const url = readEnv(SUPABASE_URL);
  if (!url) {
    throw new Error("SUPABASE_URL is required");
  }

  const anonKey = readEnv(SUPABASE_ANON_KEY);
  const serviceRoleKey = readEnv(SUPABASE_SERVICE_ROLE_KEY);

  if (!anonKey && !serviceRoleKey) {
    throw new Error("Either SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY is required");
  }

  return { url, anonKey, serviceRoleKey };
}

// Classe

/**
 * @class SupabaseClientFactory
 * @description Fabrica de clientes Supabase.
 * 
 * @example
 * const factory = new SupabaseClientFactory();
 * const client = factory.getClient();
 */
export class SupabaseClientFactory implements SupabaseClientProvider {
  private client: SupabaseClient | null = null;

  constructor(private config: SupabaseConfig = loadSupabaseConfigFromEnv()) {}

  public getClient(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    const accessToken = selectAccessKey(this.config);
    this.client = createClient(this.config.url, accessToken, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

    return this.client;
  }

  public withConfig(config: Partial<SupabaseConfig>): SupabaseClientProvider {
    const newConfig = { ...this.config, ...config };
    return new SupabaseClientFactory(newConfig);
  }
}
