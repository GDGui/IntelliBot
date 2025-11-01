# Fase 1 — Setup do **Backend**

**Stack:** Supabase (Postgres, Auth, Storage, Edge Functions), repo `backend`

## Status Atual (out/2025)

- ✅ Script de deploy central (`deploy.script`) criado; todos os módulos usam
  `deno task <module> --deploy|--migrations`.
- ✅ Hook `pre-commit` garante cópia/versionamento de migrations em
  `supabase/migrations/`.
- ✅ Workflow GitHub Actions `apply-migrations.yml` publicado; executa
  `deno task migrations` quando `supabase/migrations/**` muda.
- ✅ Task global `deno task migrations` aplica migrations com versionamento
  único de IDs.
- ✅ Prompt `collection` gera a collection Postman consolidada em
  `docs/collections/api_collection.json` usando variáveis do `.env`.
- ✅ `.env` padrão documentado com `SUPABASE_API_BASE_URL`,
  `SUPABASE_API_AUTHORIZATION`, `PROJECT_NAME`, `LOGGER_URL`, `LOGGER_TOKEN`.
- ✅ Logger remoto do core configurado para enviar dados ao módulo `system_log`
  via Supabase Edge Function (com timeout e tratamento de falhas).
- ✅ Prompts de módulos atualizados para exigir geração/atualização da
  collection ao final.

### 1.1 Configurações na plataforma

- ✅ Criar projeto Supabase (org, projeto, chaves).
- [ ] Ativar **Auth** (providers: email+link; RBAC básico).
- [ ] Habilitar **Storage** (buckets `images`, `logs`, `exports`).
- [ ] Criar **tabelas**: `users`, `workspaces`, `workspace_members`,
      `wa_instances`, `conversations`, `messages_in`, `messages_out`,
      `image_requests`, `image_assets`, `automations`, `billing_credits`,
      `audit_logs`, `webhooks`.
- [ ] Definir **RLS** por `workspace_id` e papéis (`admin`, `agent`, `viewer`).
- [ ] Criar **Edge Functions** vazias: `/webhooks/whatsapp`, `/actions/send`,
      `/admin/health`.

### 1.2 Ambiente local

- ✅ `supabase start` (Docker local) para DB/Studio.
- ✅ Migrations com `sql/` e `supabase/migrations/`.
- ✅ `.env` com `SUPABASE_URL`, `ANON_KEY`, `SERVICE_ROLE` (apenas em
  dev).
- [ ] Scripts NPM: `dev`, `lint`, `test`, `db:migrate`, `deploy:functions`.

### 1.3 CI/CD (GitHub)

- [ ] Branches: `main` (prod), `staging`, `dev`.
- [ ] GitHub Actions:

  - **CI**: lint + testes + checagem SQL (migrações secas).
  - **CD**: em `staging`/`main`, aplicar migrações (`supabase db push`) e
    `supabase functions deploy`.
- [ ] Secrets do repo: `SUPABASE_ACCESS_TOKEN`, `PROJECT_REF`, `SERVICE_ROLE`
      (apenas em ambientes — nunca no cliente).

### 1.4 Logs, observabilidade e segurança

- [ ] **Logs**: `audit_logs` (ação, usuário, ip, recurso); Storage
      `logs/edge/{date}.jsonl`.
- [ ] **Métricas**: contador por função (`calls`, `error_rate`,
      `latency_p50/p95` — gravar numa tabela `metrics_functions`).
- [ ] **Webhooks**: assinar e verificar `X-Signature` (HMAC SHA-256).
- [ ] **RLS** revisada + políticas de inserção somente via Functions Service
      Role.
- [ ] **Backups**: snapshot diário (política Supabase) e export semanal para
      Storage `exports/`.

**Entregáveis:** schema SQL + políticas RLS + 3 functions “hello-world” e
pipelines CI/CD rodando.

---

# Fase 2 — Desenvolvimento do **Backend**

### 2.1 Funcionais

- [ ] `/webhooks/whatsapp` (inbound): valida assinatura; grava `messages_in`;
      publica job (HTTP → n8n).
- [ ] `/actions/send`: envia via Evolution/Meta; grava `messages_out`.
- [ ] `/images/request`: cria `image_requests` (provider-agnostic); estado
      `queued/running/done/failed`.
- [ ] `/images/callback`: recebe do n8n, salva em Storage, atualiza
      `image_assets`/`image_requests`.
- [ ] `/wa/instances`: CRUD seguro (apenas admin) de conexões WhatsApp.

### 2.2 Técnicos

- [ ] Idempotência por `external_message_id`.
- [ ] Rate limit por `user_id`/`phone` (Redis opcional via KV do Supabase; ou
      tabela `rate_limits`).
- [ ] Testes de contrato (Pact-like) p/ webhooks e actions.

---

# Fase 3 — Setup do **Frontend** (Backoffice)

**Stack:** SPA (React/Next com static export) no **Cloudflare Pages**, repo
`web`

### 3.1 Plataforma

- [ ] Conectar repo ao **Cloudflare Pages**; ambiente `Preview` e `Production`.
- [ ] Variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `API_BASE_URL` (Edge).

### 3.2 Local

- [ ] `.env` com as chaves públicas.
- [ ] Layout base: AuthGuard, Sidebar, Tabelas (conversas, imagens, jobs).

### 3.3 CI/CD

- [ ] Actions: build (`pnpm build`), upload de artefatos; Pages faz deploy
      automático por branch.
- [ ] Checks: ESLint, TypeCheck, Lighthouse (budget mínimo).

### 3.4 Logs/Obs/Sec

- [ ] **Sentry** no front (DSN via env); map de source.
- [ ] **CSP** estrita (default-src 'self'; img supabase CDN; connect
      supabase/api).
- [ ] **Feature flags** por `workspaces` (ex.: WhatsApp Meta on/off).

**Entregáveis:** backoffice autenticado, lendo listas do Supabase e exibindo
imagens.

---

# Fase 4 — Desenvolvimento do **Frontend**

- [ ] Módulos: Conversas, Mensagens, Pedidos de Imagem, Assets, Instâncias
      WhatsApp, Créditos/Billing, Auditoria.
- [ ] Fluxos: aprovar/reprovar prompts, reenviar respostas, visualizar falhas,
      filtros por workspace.
- [ ] UX: estados vazios, loading, paginação, buscas.

---

# Fase 5 — Setup do **n8n** e **Evolution API**

**Stack:** VM com Portainer/Docker (Oracle Free sugerido), repo `infra`

### 5.1 Plataforma

- [ ] Provisionar VM; registrar domínio; **Cloudflare Tunnel** para expor `n8n`
      e `evolution`.
- [ ] `docker-compose.yml` com serviços:

  - `portainer`, `n8n` (com volume e `WEBHOOK_URL`), `evolution` (AUTH KEY,
    porta 8080), opcional `watchtower`.
- [ ] Healthchecks HTTP: `/health` (nginx sidecar simples).

### 5.2 Local

- [ ] Reproduzir compose em dev (sem tunnel) p/ testes integrados.

### 5.3 CI/CD

- [ ] GitHub Actions “Infra Sync”: ao mudar `compose`, `scp`/`ssh` +
      `docker compose pull up -d`.
- [ ] Secrets: `SSH_HOST`, `SSH_USER`, `SSH_KEY`, `CLOUDLFARED_TUNNEL_TOKEN`.

### 5.4 Logs/Obs/Sec

- [ ] **n8n**: salvar execuções (prune semanal); webhooks com secret.
- [ ] **Evolution**: logs estruturados JSON; rotação; API key obrigatória.
- [ ] **Acesso** via Tunnel (sem portas públicas); WAF/Rate limit no subdomínio.
- [ ] Backup de volumes (`n8n/.n8n`, `portainer_data/`).

**Entregáveis:** URLs públicas seguras para `n8n` e `evolution`, health OK.

---

# Fase 6 — Desenvolvimento do **chatbot** no **n8n**

- [ ] Workflow **Inbound**: recebe payload do backend → sanitiza → roteia por
      intenção (help, gerar imagem, status).
- [ ] Workflow **Geração**: provedor de IA (pluggable), aguarda job, upload no
      Storage (URL assinada), callback no `/images/callback`.
- [ ] Workflow **Erros/Retry**: filas com backoff; notificação Slack/Email
      opcional.
- [ ] Governance: limites de prompt, blacklist de termos, quota por workspace.

**Entregáveis:** conversas ponta-a-ponta, texto → imagem → resposta com mídia.

---

# Fase 7 — Setup da **API WhatsApp Meta** oficial

_(rodará em paralelo ao Evolution; você escolhe por workspace qual usar)_

### 7.1 Plataforma

- [ ] Business App/Manager, número, template messages aprovados.
- [ ] App → Webhook verificado (pode ser Supabase Edge `/webhooks/meta`).

### 7.2 Local

- [ ] Simular chamadas com tokens de dev; mock de webhooks.

### 7.3 CI/CD

- [ ] Action de rotação de **App Secret**/**Access Token** (com GitHub
      Environments).
- [ ] Variáveis separadas por ambiente (`dev/staging/prod`).

### 7.4 Logs/Obs/Sec

- [ ] Validação de `X-Hub-Signature-256`.
- [ ] Tabelas `meta_messages_in/out` (separadas) ou colunas `provider`.
- [ ] Métricas: consumo de templates/sessões (para billing).

**Entregáveis:** webhook validado, envio/recebimento funcionais na sandbox.

---

# Fase 8 — Integração com a **API da Meta**

- [ ] Abstração `Provider` no backend (`evolution` | `meta`), seleção por
      `workspace` ou `conversation`.
- [ ] Suporte a **media upload** e **template messages** (HSM) no backoffice.
- [ ] Monitoramento de **status de entrega** (ack, read, failed) com
      reconciliação.

**Entregáveis:** trocar de provedor por configuração, sem alterar o front.

---

## Estrutura de repositórios sugerida

```
/backend
  /supabase (migrations, policies, seeds)
  /functions (edge)
  /pkg (libs compartilhadas)
/web
  /src (app, pages, components, features)
/infra
  docker-compose.yml
  cloudflared/
  scripts/ (deploy_vm.sh, backup_volumes.sh)
```

## Padrões de segurança (transversal)

- Princípio do **menor privilégio**; segredos só em runtime.
- RLS obrigatória; tudo que mexe em dados sensíveis via **Edge Functions** com
  **Service Role** controlado.
- **Assinatura** de todos webhooks (Evolution, n8n, Meta).
- **CSP** e **CORS** restritos; **rate limit** por IP/usuário; **idempotência**
  por chave.
- Backups automáticos (DB + volumes Docker); testes de restauração mensais.
