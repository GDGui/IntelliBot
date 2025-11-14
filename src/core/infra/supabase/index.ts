// Barrel do pacote de supabase - centraliza exportacoes

export type { SupabaseConfig } from "../../infra/supabase/supabase_config.ts";

export {
  loadSupabaseConfigFromEnv,
  SupabaseClientFactory,
  selectAccessKey,
  readEnv,
} from "../../infra/supabase/supabase_client.ts";

export type { SupabaseClientProvider } from "../../infra/supabase/supabase_client.ts";

