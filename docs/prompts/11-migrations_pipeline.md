# Prompt: Configurar pipeline apply-migrations.yml

Sua responsabilidade é garantir que o workflow GitHub Actions
`.github/workflows/apply-migrations.yml` exista e siga as regras abaixo
exatamente.

## 1. Disparo

- O workflow deve rodar em:
  - `push` somente quando arquivos dentro de `supabase/migrations/**` forem
    modificados.
  - `workflow_dispatch` manual.

## 2. Jobs

- Nome do job: `migrate`.
- Deve usar `runs-on: ubuntu-latest`.
- Permissões mínimas: `contents: read`.

## 3. Etapas obrigatórias

1. **Checkout** com `actions/checkout@v4`.
2. **Setup Deno** com `denoland/setup-deno@v1` (versão `2.5.4`).
3. **Instalar Supabase CLI** com `supabase/setup-cli@v1` (versão `latest`).
4. **Cache do Deno** usando `actions/cache@v4`, apontando para `~/.cache/deno`.
5. **Gerar .env** contendo:
   ```
   SUPABASE_URL=${{ secrets.SUPABASE_URL }}
   SUPABASE_ANON_KEY=${{ secrets.SUPABASE_ANON_KEY }}
   SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   SUPABASE_PROJECT_ID=${{ secrets.SUPABASE_PROJECT_ID }}
   SUPABASE_DB_PASSWORD=${{ secrets.SUPABASE_DB_PASSWORD }}
   ```
6. **Aplicar migrations** executando:
   ```bash
   deno task migrations
   ```
   com as variáveis de ambiente:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_DB_PASSWORD`
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_ID`
   - `SUPABASE_DB_URL` (opcional, se existir nos secrets)

## 4. Dependências

- Antes de rodar `deno task migrations`, certifique-se de que:
  - `deploy.script` esteja presente na raiz e executável.
  - `deno.json` contenha a task `"migrations": "bash ./deploy.script"`.

## 5. Validação

- O workflow deve falhar caso qualquer secret essencial esteja ausente
  (`set -euo pipefail` + verificações).
- Logs precisam indicar a execução do comando final (`deno task migrations`).

Siga estes passos sempre que o prompt for acionado; se o workflow já estiver
conforme as instruções, apenas valide e não faça alterações.
