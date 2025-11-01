// src/core/infra/supabase/index.ts

/**
 * Centraliza as exportacoes do modulo Supabase.
 */

export type { SupabaseConfig } from "./supabase_config.ts";
export {
  loadSupabaseConfigFromEnv,
  SupabaseClientFactory,
} from "./supabase_client.ts";
export type { SupabaseClientProvider } from "./supabase_client.ts";
