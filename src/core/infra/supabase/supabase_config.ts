/**
 * Configuracao basica para cliente Supabase.
 *
 * Comentarios em PT-BR sem acentuacao.
 *
 * Exemplo de uso:
 * ```ts
 * import type { SupabaseConfig } from "./supabase_config.ts";
 * const cfg: SupabaseConfig = {
 *   url: "https://project.supabase.co",
 *   anonKey: "public-anon-key",
 * };
 * ```
 */
export interface SupabaseConfig {
  url: string;
  anonKey?: string;
  serviceRoleKey?: string;
}

