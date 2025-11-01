# Objetivo

Orientar a criacao de um novo modulo de API completo (domain, data, presenter)
seguindo os padroes atuais do projeto, incluindo script de deploy, `index.ts` e
`task.ts`.

# Passos

1. Pergunte ao solicitante:
   - Nome do modulo / entidade (ex.: `products`, `customers`).
   - Tipo de backend desejado: `supabase` ou `http`.

2. Verifique em `assets/models/<nome>.json`:
   - Se existir, utilize os campos do JSON como base para a entidade (campos
     camelCase, convertidos de snake_case se houver).
   - Se nao existir, crie entidade com apenas `id: string` e campos adicionais
     conforme especificado pelo solicitante (ou somente `id` se nenhum).

3. **Metodos padrao do modulo**
   - Toda a pilha (datasource → repository → service → viewmodel → API) deve
     implementar os seguintes metodos:
     - `findById(id: string)`
     - `findByName(name: string)` (busca parcial case insensitive)
     - `list()` (ou `listAll` no service, `list` na API) retornando apenas itens
       ativos
     - `create(payload)`
     - `update(payload)`
     - `deactivate(id)` (delete logico: mantem o registro, apenas marca como
       inativo)
   - Todos os metodos que retornam colecoes devem filtrar registros por
     `active = true`, exceto quando a regra de negocio exigir diferente. O
     endpoint `deactivate` nao remove dados, apenas ajusta a flag `active`.

4. **Etapa 1 – Domain**
   - Criar os arquivos:
     - `src/api/<nome>/domain/entities/<nome>.ts`
       - Definir `Snapshot`, payloads `Create`, `Update` e a entidade com
         validacoes.
       - Implementar `create`, `restore`, `update` dentro da entidade usando o
         helper `result`.
     - `src/api/<nome>/domain/repositories/I<Nome>.repository.ts`
       - Declarar metodos padrao (veja etapa 3) retornando `Result<...>`.
     - `src/api/<nome>/domain/services/<nome>.service.ts`
       - Expor a interface do servico `I<nome>Service` com metodos padrao.
       - Implementar `<nome>Service` (ou equivalente) delegando ao repositorio e
         validando entradas (`find/list` apenas ativos).
     - Barrels:
       - `src/api/<nome>/domain/entities/index.ts`
       - `src/api/<nome>/domain/repositories/index.ts`
       - `src/api/<nome>/domain/services/index.ts`
       - `src/api/<nome>/domain/index.ts`

5. **Etapa 2 – Data**
   - Criar os arquivos:
     - `src/api/<nome>/data/model/<nome>.model.ts`
       - Deve expor metodos `toEntity`, `fromEntity`, `toJson`, `fromJson` para
         conversao completa (utilize os helpers de serializacao em
         `src/core/helpers/json.helper.ts`).
       - Mapeia snapshots ↔ registros, garantindo campos `active`, timestamps e
         consistencia com o dominio.
     - `src/api/<nome>/data/datasource/<nome>.datasource.ts`
       - Se o backend for **Supabase**, utilize `SupabaseClientFactory` /
         `SupabaseClientProvider` e `supabase_client.ts` (barrel
         `src/core/infra/supabase/index.ts`).
       - Se for **HTTP**, utilize `src/core/infra/http/http.client.ts` (criar
         adaptadores adicionais se necessario).
       - Implementar metodos padrao (`findById`, `findByName`, `list`, `insert`,
         `update`) sempre filtrando registros `active` nas consultas de
         listagem/busca.
       - `findByName` deve usar `ilike` (quando Supabase) com pattern `%<term>%`
         escapado.
       - `deactivate` acontece via `update` (ajustando flag `active`), nunca
         delete fisico.
     - `src/api/<nome>/data/repositories/<nome>.repository.ts`
       - Converte model ↔ entidade e garante retorno `Result`.
     - Barrels:
       - `src/api/<nome>/data/model/index.ts`
       - `src/api/<nome>/data/datasource/index.ts`
       - `src/api/<nome>/data/repositories/index.ts`
       - `src/api/<nome>/data/index.ts`
     - Migration inicial:
       - `src/api/<nome>/data/migrations/<nome>.migration_01.sql` (tabela com
         colunas basicas + `active`, `created_at`, `updated_at`)

6. **Etapa 3 – Presenter**
   - Criar os arquivos:
     - `src/api/<nome>/presenter/<nome>.viewmodel.ts`
       - Expor interface com metodos padrao (`list`, `get`, `findByName`,
         `create`, `update`, `deactivate`) delegando ao service.
     - `src/api/<nome>/presenter/<nome>.api.ts`
       - Construir rotas `GET /`, `GET /search`, `GET /:id`, `POST /`,
         `PUT /:id`, `DELETE /:id`.
       - `GET /` e `/search` retornam apenas ativos; `/search` aceita `name` ou
         `q` como termo parcial.
     - `src/api/<nome>/presenter/index.ts`
       - Monta bindings (datasource → repository → service → viewmodel → API).

7. **Etapa 4 – Root e utilitarios**
   - `src/api/<nome>/index.ts`:
     - Instancie o modulo (`create<Nome>Module`) e aplique
       `createLoggerMiddleware`.
     - Crie um `Hono` raiz e registre as rotas no caminho `/`.
     - Implemente um handler que reescreve qualquer prefixo `/<nome>`
       (necessario em Supabase Functions, onde a request chega como
       `/functions/v1/<nome>...`).
     - Exporte tanto o `app` quanto o handler (`<nome>Fetch`) para permitir
       reutilizacao.
     - Exemplo:
       ```ts
       import { Hono } from "../../deps.ts";
       import {
         loadSupabaseConfigFromEnv,
         SupabaseClientFactory,
       } from "../../core/infra/index.ts";
       import { createLoggerMiddleware } from "../../core/logger/index.ts";
       import { create<Nome>Module } from "./presenter/index.ts";

       const provider = new SupabaseClientFactory(loadSupabaseConfigFromEnv());
       const { api } = create<Nome>Module(provider);
       api.use("*", createLoggerMiddleware());

       const app = new Hono();
       app.route("/", api);

       const handleRequest = (request: Request) => {
         const url = new URL(request.url);
         if (url.pathname === "/<nome>" || url.pathname.startsWith("/<nome>/")) {
           const rewritten = new URL(request.url);
           rewritten.pathname = url.pathname.replace(/^\/<nome>/, "") || "/";
           return app.fetch(new Request(rewritten, request));
         }
         return app.fetch(request);
       };

       if (import.meta.main) {
         Deno.serve(handleRequest);
       }

       export { create<Nome>Module } from "./presenter/index.ts";
       export { app as <nome>App, handleRequest as <nome>Fetch };
       ```

- `deploy.script` (raiz): script centralizado que recebe o nome do modulo e, com
  `--deploy` ou `--migrations`, executa fmt/lint/check, aplica a migration mais
  recente e (quando aplicável) publica a function no Supabase.
- `src/api/<nome>/task.ts`: aceita `--deploy` e `--migrations`; em ambos os
  casos delega para `./deploy.script <nome> <flag>`. Sem flags, aplica o
  middleware de logs e levanta `Deno.serve` na porta padrao (libera a porta se
  ocupada).

8. **Regras gerais**
   - Comentarios/doc: cada classe e metodo principal deve conter comentarios em
     portugues BR sem acentos e blocos `Exemplo de uso`.
   - Sempre utilize o helper `result` para retorno de sucesso/erro em
     datasource, repositorio e servico.
   - Datasource:
     - Se o backend for `supabase`, use `SupabaseClientFactory` /
       `SupabaseClientProvider` (barrel `src/core/infra/index.ts`).
     - Para `http`, use o cliente correspondente em `src/core/infra/http/` (crie
       stubs se necessario).
   - Middleware de logs: `index.ts` e `task.ts` devem sempre aplicar
     `createLoggerMiddleware`.

9. **Padrao do deploy script (raiz)**
   1. Recebe `<modulo>` e a flag (`--deploy` ou `--migrations`).
   2. Calcula `MODULE_DIR`, `MIGRATIONS_DIR`, prepara diretório temporário,
      copia `src`, `deno.json` e `deno.lock` (se existir).
   3. Executa `deno fmt --check src`, `deno lint src` e `deno check` nos
      arquivos principais do módulo (`index.ts`, `task.ts`).
   4. Localiza a migration mais recente (`*.sql`) do módulo, copia para
      `supabase/migrations/<timestamp>__<modulo>.sql`.
   5. Caso `SUPABASE_PROJECT_ID` esteja definido, roda `supabase link`.
   6. Executa `supabase db push` (tratando o aviso de migrations ja aplicadas).
   7. Quando a flag for `--deploy`, gera `supabase/functions/<modulo>/index.ts`
      apontando para `<camelCase>Fetch` e roda `supabase functions deploy`.
   8. A CLI espera comandos como:
      - `deno task <modulo> --deploy` (checks + migrations + deploy).
      - `deno task <modulo>` (servidor local).
      - `deno task migrations` (copia migrations novas e executa
        `supabase db push` para todos os modulos).
10. Atualize `deno.json` adicionando a task `${nome}` no formato:

```json
"${nome}": "deno run --allow-env --allow-net --allow-read --allow-run --env-file=.env ./src/api/${nome}/task.ts"
```

11. Integre a documentacao OpenAPI reutilizando `src/core/openapi/`:

- Crie `src/api/<nome>/presenter/<nome>.openapi.ts` exportando um objeto
  `...OpenApiDocument` (use `as const`) descrevendo endpoints, esquemas e
  respostas.
- No arquivo `presenter/<nome>.api.ts`, importe `createOpenApiDocs` de
  `src/core/openapi/openapi.ts` (via barrel `src/core/index.ts`) e o documento
  criado acima.
- Dentro da funcao `create<Nome>Api`, instancie
  `createOpenApiDocs({ title: "<Nome> API", specUrl: "./openapi.json" })`.
- Adicione as rotas:
  - `app.get("/openapi.json", ...)` retornando o documento com `c.json`.
  - `app.get("/scalar", docs.scalar)` e `app.get("/swagger", docs.swagger)`; use
    caminhos simples sem o prefixo `/docs/`.
- Garanta que o bundle exportado por `createOpenApiDocs` esteja acessivel a
  partir do modulo via `src/core/index.ts`.

12. **CI/CD**
    - Crie (ou atualize) o workflow `.github/workflows/<nome>-deploy.yml`. Caso
      ja exista para outro modulo, use-o como referencia e ajuste
      nomes/caminhos.
    - O workflow deve:
      1. Disparar em `push` para `main` somente quando arquivos
         `src/api/<nome>/**` forem modificados (use filtro `paths`).
      2. Incluir `workflow_dispatch` para rodar manualmente.
      3. Etapas minimas:
         - `actions/checkout`.
         - `denoland/setup-deno@v1` com `deno-version: 2.5.4` (ou a versao atual
           usada no projeto).
         - `supabase/setup-cli@v1` para instalar o Supabase CLI.
         - Cache do `DENO_DIR` com `actions/cache`.
         - Passo que cria um `.env` temporario no runner com os secrets do
           repositorio.
         - Execucao de `deno task <nome> --deploy`.
    - Exemplo (substitua `<nome>` pelo nome real do modulo):
      ```yaml
      name: Deploy <Nome> Module

      on:
        push:
          branches: [main]
          paths:
            - "src/api/<nome>/**"
        workflow_dispatch:

      jobs:
        deploy:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            - uses: denoland/setup-deno@v1
              with:
                deno-version: 2.5.4
            - uses: supabase/setup-cli@v1
              with:
                version: latest
            - uses: actions/cache@v4
              with:
                path: ~/.cache/deno
                key: ${{ runner.os }}-deno-${{ hashFiles('deno.lock') }}
                restore-keys: |
                  ${{ runner.os }}-deno-
            - name: Create environment file
              run: |
                cat <<'EOF' > .env
                SUPABASE_URL=${{ secrets.SUPABASE_URL }}
                SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
                SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
                SUPABASE_PROJECT_ID=${{ secrets.SUPABASE_PROJECT_ID }}
                SUPABASE_DB_PASSWORD=${{ secrets.SUPABASE_DB_PASSWORD }}
                EOF
            - name: Deploy <nome>
              env:
                SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
                SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
              run: deno task <nome> --deploy
      ```
    - Assegure-se de que os secrets `SUPABASE_ACCESS_TOKEN`,
      `SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_DB_PASSWORD` estejam configurados
      no GitHub antes de habilitar o pipeline.

13. **Collection Postman**
    - Após concluir o módulo execute o prompt `docs/prompts/9-collection.md`.

# Checagem

- Garanta que barrels (`index.ts`) existam em cada pasta.
- Validate `deno check` nos arquivos principais.
- Confirme que imports utilizam apenas os barrels (`../../core/index.ts`, etc.).
- Assegure que `deno task <nome>` levanta a API local e
  `deno task <nome> --deploy` roda o script de deploy.
