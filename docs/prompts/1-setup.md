# Objetivo

Recriar a estrutura base do projeto, incluindo diretorios, arquivo `.gitignore`,
`src/deps.ts`, `deno.json`, `deno.lock` e configuracoes do VS Code para Deno.

# Instrucao

1. **Estrutura de diretorios**\
   Crie, na raiz do repositorio, as seguintes pastas (preservando hierarquia e
   nomes exatos):
   - `src`
   - `src/core`
   - `src/core/helpers`
   - `src/core/adapters`
   - `src/core/infra`
   - `src/core/infra/configs`
   - `src/core/infra/db`
   - `src/core/infra/supabase`
   - `src/api`
   - `docs/prompts`
   - Para cada pasta criada, adicione um `index.ts` vazio servindo como barrel
     file.

2. **Criar `.gitignore`**\
   Gere o arquivo `.gitignore` na raiz com o conteudo:
   ```
   # Ambiente e variaveis
   .env
   .env.*
   !.env.example

   # Dependencias
   node_api/
   pnpm-lock.yaml
   package-lock.json
   yarn.lock

   # Build / artefatos
   dist/
   build/
   out/
   .turbo/
   .cache/

   # IDE / SO
   .DS_Store
   Thumbs.db
   .idea/
   .vscode/

   # Supabase local
   supabase
   supabase/.branches
   supabase/.temp
   supabase/.env
   supabase/.snapshots

   # Logs
   *.log
   logs/
   ```

3. **Criar `.env`**\
   Adicione o arquivo `.env` na raiz com:
   ```
   SUPABASE_URL="https://your-project.supabase.co"
   SUPABASE_ANON_KEY="public-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="service-role-key"
   SUPABASE_PROJECT_ID="your-project-id"
   SUPABASE_API_BASE_URL="http://localhost:8080"
   SUPABASE_API_AUTHORIZATION="Bearer <token>"
   PROJECT_NAME="Image Express"
   LOGGER_URL="https://your-project.functions.supabase.co/system_log"
   LOGGER_TOKEN="super-secure-token"
   LOGGER_TIMEOUT_MS="2000"
   ```

4. **Criar `deno.json`**\
   Adicione um arquivo `deno.json` na raiz contendo:
   ```json
   {
     "tasks": {
       "products": "deno run --allow-env --allow-net --allow-read --allow-run ./src/api/products/task.ts"
     }
   }
   ```

5. **Criar `deno.lock`**\
   Caso ainda nao exista, inicialize o lock executando `deno cache src/deps.ts`
   (gera automaticamente) ou crie um arquivo vazio `deno.lock` que sera
   preenchido no primeiro cache.

6. **Criar `src/deps.ts`**\
   Adicione o arquivo `src/deps.ts` com:
   ```ts
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
   ```
   Em seguida execute `deno cache src/deps.ts`.

7. **Configurar VS Code (`.vscode/`)**\
   Crie a pasta `.vscode` com dois arquivos:
   - `extensions.json`:
     ```json
     {
       "recommendations": [
         "denoland.vscode-deno"
       ]
     }
     ```
   - `settings.json`:
     ```json
     {
       "deno.enable": true,
       "deno.lint": true,
       "deno.suggest.imports.hosts": {
         "https://deno.land": true,
         "npm:": true
       },
       "deno.enablePaths": [
         "src"
       ]
     }
     ```

8. **Criar `README.md`**\
   Adicione um arquivo `README.md` na raiz contendo:
   - Nome e descricao do projeto.
   - Instrucoes para rodar localmente (`deno task <modulo>`).
   - Orientacoes de deploy (`deno task <modulo> --deploy` ou workflow CI).
   - Lista das variaveis de ambiente essenciais (`SUPABASE_URL`,
     `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_ID`,
     etc.).

# Checagem

- Confirme que a estrutura de pastas corresponde exatamente à lista acima.
- Verifique que cada pasta possui um `index.ts` (barrel file) conforme padrao.
- Verifique que `.gitignore`, `src/deps.ts`, `deno.json`, `deno.lock` e os
  arquivos em `.vscode/` foram criados com o conteudo indicado.
- Assegure-se de que `deno cache src/deps.ts` foi executado apos criar o
  arquivo, gerando/atualizando o `deno.lock`.
