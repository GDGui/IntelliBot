// src/core/infra/supabase/supabase_config.ts

/**
 * @interface SupabaseConfig
 * @description Define a configuracao para o cliente Supabase.
 * 
 * @property {string} url - A URL do projeto Supabase.
 * @property {string} [anonKey] - A chave anonima de API.
 * @property {string} [serviceRoleKey] - A chave de servico (service role) de API.
 * 
 * @example
 * const config: SupabaseConfig = {
 *   url: "https://project.supabase.co",
 *   anonKey: "your-anon-key",
 * };
 */
export interface SupabaseConfig {
  url: string;
  anonKey?: string;
  serviceRoleKey?: string;
}
