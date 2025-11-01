# Prompt: Gerar/atualizar collection Postman completa

Quando este prompt for acionado, o agente deve produzir **uma collection única**
contendo todos os módulos finalizados com endpoints HTTP.

## Fluxo

1. **Carregar variáveis de ambiente**
   - Leia o arquivo `.env` na raiz e capture:
     - `SUPABASE_API_BASE_URL` (URL base que substituirá `{{baseUrl}}`).
     - `SUPABASE_API_AUTHORIZATION` (valor do header `Authorization`, se
       definido).
     - `PROJECT_NAME` (nome amigável para o campo `name` da collection).
   - Se alguma variável estiver ausente, informe ao usuário e pare até que seja
     provida.

2. **Descobrir módulos com endpoints**
   - Liste as pastas em `src/api`.
   - Considere “módulo finalizado” aquele que possui `presenter/<nome>.api.ts`.
   - Para cada módulo, identifique as rotas exportadas (analisando o arquivo
     `*.api.ts` ou `openapi` correspondente).

3. **Extrair informações das rotas**
   - Para cada rota encontrada, determine:
     - Método HTTP (`GET`, `POST`, etc.).
     - Caminho relatado (ex.: `/`, `/search`, `/:id`).
     - Campos de query (`name`, `q`, ...).
     - Se houver corpo (POST/PUT), monte um JSON de exemplo, respeitando os
       payloads disponíveis no domínio (`create`/`update`).
   - Não incluir rotas de documentação (ex.: `/openapi.json`, `/scalar`,
     `/swagger`) — a collection deve focar apenas nos endpoints funcionais.

4. **Montar collection Postman**
   - Estrutura compatível com Postman v2.1.
   - `info.name` deve utilizar `${PROJECT_NAME} API Collection` (ou similar)
     para indicar origem.
   - `info.description` deve ser um texto rico, cobrindo:
     - Resumo do projeto (ex.: finalidade, público-alvo).
     - Lista dos módulos expostos e breve descrição de cada serviço.
     - Instruções para uso (ex.: preencher variáveis, fluxo de autenticação,
       exemplos de chamadas).
   - Agrupe requests por módulo (folder `Products`, `Order Request`, etc.) e
     **adicione descrição completa na pasta**:
     - Resumo do propósito do módulo.
     - Campos principais disponibilizados.
     - Dependências ou relações (ex.: consumo por outros módulos).
   - Cada request:
     - URL: `{{baseUrl}}/<rota>` trocando `:` por `{{param}}` (ex.: `/:id` →
       `/{{id}}`).
     - Headers padrão:
       - `Content-Type: application/json` (quando houver body).
       - `Authorization: {{authorization}}` (SEMPRE incluir; o valor real vem da
         variável).
     - Body em JSON com base nos payloads.
     - Params/Queries preenchidos com exemplos.
     - Descrição completa mencionando propósito, campos usados e possíveis
       respostas.
   - Variáveis da collection:
     - `baseUrl` → valor exato de `SUPABASE_API_BASE_URL` (obrigatória).
     - `authorization` → valor exato de `SUPABASE_API_AUTHORIZATION`
       (obrigatória; se não existir, falhe solicitando ao usuário).
     - `projectName` → valor de `PROJECT_NAME` (opcional, mas use quando
       presente).

5. **Salvar em `docs/collections/api_collection.json`**
   - Se o arquivo ainda não existir, crie-o.
   - Caso já exista, sobrescreva-o com a nova versão (sem criar arquivos com
     timestamp). Isso garante versionamento via git.

6. **Informar resultado**
   - Reporte o caminho salvo.
   - Liste brevemente os módulos e endpoints incluídos.

Siga estes passos sempre que o prompt `collection` for executado.
