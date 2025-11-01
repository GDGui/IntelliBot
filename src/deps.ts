import process from "node:process";

// Framework HTTP (Hono via npm)
export { Hono } from "npm:hono@4.3.11";
export type { Context, MiddlewareHandler } from "npm:hono@4.3.11";
export { cors } from "npm:hono@4.3.11/cors";
export { swaggerUI } from "npm:@hono/swagger-ui@0.2.1";
export { apiReference } from "npm:@scalar/hono-api-reference@0.9.22";

// Supabase SDK (browser build)
export {
  createClient,
  type SupabaseClient,
} from "npm:@supabase/supabase-js@2.45.4";

// Para testes unitarios
export { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
export { loadSync } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
export { existsSync } from "https://deno.land/std@0.224.0/fs/exists.ts";

// Compatibilidade Node (Deno)
export { process as nodeProcess };
