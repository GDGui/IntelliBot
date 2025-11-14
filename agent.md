# Guia do Agente — Mentoria AI

Este documento consolida os pontos essenciais encontrados em `docs/` para orientar agentes (e humanos) a executar e evoluir o projeto com consistência. Ele resume arquitetura, padrões, tarefas por fase e checklists operacionais (migrations, CI/CD, documentação e geração de módulos).

## Visão Geral do Roadmap (docs/prompts/0-plan.md)
- Fase 1 — Setup do backend no Supabase (migrations versionadas, script de deploy central, hook de pre-commit e pipeline de apply-migrations no GitHub Actions).
- Fase 2 — Desenvolvimento do backend (webhooks, actions, geração e callback de imagens, CRUD de instâncias WhatsApp; requisitos técnicos: idempotência, rate limit, testes de contrato).
- Fase 3 e 4 — Setup e desenvolvimento do front (Backoffice), com Cloudflare Pages, variáveis de ambiente e observabilidade.
- Fase 5 e 6 — Infra (n8n + Evolution API) e chatbot (workflows inbound/geração/erros).
- Fase 7 e 8 — Integração/alternância Evolution x WhatsApp Meta (webhooks assinados, templates, status de entrega).
- Segurança transversal: RLS, assinatura de webhooks, CSP/CORS restritos, rate limit, backups e testes de restauração.

## Setup de Projeto (docs/prompts/1-setup.md)
- Estruturar diretórios base (`src/`, `src/core/**`, `src/api`, `docs/prompts`) e criar barrels `index.ts`.
- Criar `.gitignore`, `.env`, `deno.json` (tasks), `deno.lock`, `src/deps.ts` (reexporta dependências Hono, Supabase, std), e configurações VS Code (`.vscode/`).
- README com instruções de execução (`deno task <modulo>`) e deploy.

## Arquitetura (docs/prompts/2-arquitetura.md)
- Clean Architecture + DDD por módulo de API: `domain` (entidades, contratos), `data` (datasource/model/mapper), `presenter` (HTTP/Functions), e `core` (helpers e cross-cutting).
- Dependências unidirecionais: presenter → domain (use cases) → data (infra). Domínio não conhece implementação concreta.

## Diretrizes do Agente (docs/prompts/3-agent.md)
- Respeitar camadas e reusar contratos/helpers existentes; priorizar o helper `result`.
- Erros: `createAppError` e `ApiErrors` no presenter; domínio usa apenas `AppError` via `Result` (não lançar exceções cruas).
- Repositórios/serviços retornam `Promise<Result<...>>`.
- Comentários em PT-BR (ASCII em código), exemplos de uso e barrels consistentes; imports externos sempre via `src/deps.ts`.

## Helpers obrigatórios (docs/prompts/4-helpers.md)
- `src/core/helpers/errors.ts`: tipos `AppError`, criação e normalização de erros (`createAppError`, `isAppError`, `normalizeAppError`).
- `src/core/helpers/api_errors.ts`: classe `ApiErrors` com atalhos HTTP padrão, `fromUnknown` e `custom`.
- `src/core/helpers/result.ts`: `Result`, `ResultHandler` e fábrica `result` (`Success`, `Error`, `from`).
- `src/core/helpers/index.ts`: barrel exportando funções, tipos e classes.

## Logger (docs/prompts/5-logger.md)
- Tipos em `logger.types.ts` e implementações `log.console.ts` (funcional) e `log.remote.ts` (stub com erro não implementado).
- `logger.middleware.ts`: escolhe logger pelo ambiente (`local/development/test` → console) e registra início/sucesso/erro por request.
- Barrel do módulo de logger e reexport em `src/core/index.ts`.

## HTTP Client (docs/prompts/6-http.md)
- `src/core/infra/http/http.client.ts`: `createHttpClient` baseado em `fetch`, métodos (`request`, `get/post/put/patch/delete`, `authenticate`), helpers (`buildUrl`, `parseBody`, `buildAuthBody`) e retorno via `result` + `createAppError`.

## Supabase Core (docs/prompts/7-supabase.md)
- `src/core/infrastructure/supabase/`: `supabase_config.ts`, `supabase_client.ts` e barrel.
- `SupabaseClientFactory` com cache, seleção de token (anon vs service role), leitura robusta de env (`Deno.env`/`process.env`).

## Documentação OpenAPI (docs/prompts/8-openapi.md)
- `src/core/openapi/` com middlewares: `scalar.ts`, `swagger.ts` e orquestração `openapi.ts`; barrel atualizado. Dependências expostas via `src/deps.ts`.

## Criação de Módulos (docs/prompts/9-module.md)
- Perguntar nome/entidade e backend (`supabase` ou `http`). Opcionalmente ler `assets/models/<nome>.json` para estruturar payloads/entidade.
- Implementar métodos padrão ponta a ponta: `findById`, `findByName` (ilike), `list` (apenas ativos), `create`, `update`, `deactivate` (delete lógico via `update`).
- Domain: entidade + repos + service (sempre `Result`). Data: model/datasource/repository (Supabase/HTTP). Presenter: viewmodel + API (rotas REST). Barrels em todas as camadas.
- `src/api/<nome>/index.ts` e `task.ts` com `Hono`, `createLoggerMiddleware`, suporte a prefixo em Supabase Functions, tasks no `deno.json`.
- Integração OpenAPI por módulo: rota `/openapi.json`, e UIs `/scalar` e `/swagger` via `createOpenApiDocs`.
- CI/CD por módulo: workflow de deploy com Supabase CLI e secrets necessários.

## Migrations e Pipeline (docs/prompts/10-precommit.md, 11-migrations_pipeline.md)
- Hook `.githooks/pre-commit` (bash, `set -euo pipefail`) copia migrations adicionadas em `src/api/*/data/migrations/*.sql` para `supabase/migrations/<timestamp>_<suffix>__<module>__<basename>`, adiciona ao staging e evita colisões.
- Workflow `.github/workflows/apply-migrations.yml`: dispara em mudanças de `supabase/migrations/**` e roda `deno task migrations` com Supabase CLI devidamente configurado, usando secrets obrigatórios.

## Collection Postman (docs/prompts/12-collection.md)
- Geração consolidada em `docs/collections/api_collection.json` a partir de módulos concluídos. Requer variáveis `.env`: `SUPABASE_API_BASE_URL`, `SUPABASE_API_AUTHORIZATION`, `PROJECT_NAME`.
- Estrutura v2.1, agrupada por módulo, com exemplos de body/params e headers padrão (incluindo `Authorization`).

---

## Checklist Operacional (alto nível)
1) Setup base:
   - Estrutura de diretórios + barrels criados
   - `.env`, `.gitignore`, `deno.json`, `deno.lock`, `src/deps.ts`
   - VS Code habilitado para Deno
2) Core pronto:
   - Helpers (`errors`, `api_errors`, `result`)
   - Logger (console + middleware) e reexports
   - HTTP client e Supabase core
   - OpenAPI (scalar, swagger, orquestrador) + exports em `src/deps.ts`
3) Dev workflow:
   - Hook `.githooks/pre-commit` ativo e executável
   - `deploy.script` e task `migrations` no `deno.json`
   - Workflow `apply-migrations.yml` publicado
4) Módulos de API:
   - Domain/Data/Presenter completos, com testes essenciais
   - Rotas REST + docs OpenAPI por módulo
   - Tasks `deno task <modulo>` e deploy
5) Collection:
   - `docs/collections/api_collection.json` gerada a partir dos módulos

## Padrões Essenciais de Código
- Retornos com `result` em todas as bordas (datasource/repository/service/presenter). Não lançar exceções cruas.
- Erros semânticos com `createAppError` e, no presenter, `ApiErrors`.
- Imports de libs externas sempre via `src/deps.ts` e consumo via barrels internos.
- Comentários em PT-BR (ASCII em código), com bloco “Exemplo de uso” nos pontos principais.

## Próximos Passos Sugeridos
- Implementar o núcleo `src/core/helpers` e `src/core/logger` para habilitar validação (`deno check`) desde cedo.
- Adicionar `src/core/infra/http` e `src/core/infrastructure/supabase` para suportar datasources.
- Criar o primeiro módulo de referência (ex.: `products`) seguindo o prompt 9, incluindo suas migrations e documentação OpenAPI.
- Publicar e testar o hook pre-commit e o workflow de migrations.
- Gerar a primeira collection Postman a partir do módulo concluído.

## Como este guia deve ser usado por agentes
- Antes de editar/gerar código, consultar a seção específica do tema (helpers, logger, http, supabase, openapi, módulo, CI/migrations, collection) e seguir os requisitos “exatos” dos prompts.
- Ao finalizar uma entrega, garantir que barrels e exports estejam consistentes e que `deno check` passe.
- Sempre atualizar/gerar prompts em `docs/prompts/` quando houver evolução estrutural que impacte reprodução.

