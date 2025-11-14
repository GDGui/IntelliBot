# Especificações

1. A api deve ser criada em src/api/<nome>;
2. A api deve utilizar o padrão result utilizando src/core/helpers/index.ts e sempre retornar um resultado padronizado de [Success] ou [Failure];
3. A api deve utilizar o log middleware de src/core/logger/index.ts;
4. A api deve sempre importar as classes a partir do index.ts
5. O ponto de entrada e exportação da API deve ser src/api/<nome>/index.ts;
6. A Api deve ser baseada em minimal api por entidade;
7. Estrutura obrigatória da api: src/api/<nome>/:
    7.1 index.ts
    7.2 <nome>.model.ts
    7.3 <nome>.repository.ts
    7.4 <nome>.service.ts
    7.5 <nome>.handler.ts
8. Pergunte ao usuário qual tipo de integração será utilizada:
    8.1 Supabase - src/core/infra/supabase/
    8.2 Http - src/core/infra/http/
    8.3 O repository deve utilizar o cliente de acordo com a escolha do usuário;
9. Pergunte ao usuário qual é o nome da api;
10. Pesquise pelo model correspondente em assets/mocks/<nome>.json
11. Caso não encontre o model correspondente peça para o usuário enviar um modelo no padrão json;
12. Métodos obrigatórios que a api deve ter:
    12.1 get
    12.2 post
    12.3 put
    12.4 patch
    12.5 delete
    12.6 getByName
    12.7 getById
    12.8 getByCreatedAt
    12.9 getByQuery - deve permitir filtrar pela coluna e valor esperado;
13. Toda api deve ter a migration de criação/alteração da tabela do banco de dados;
14. As migrations da api devem ficar em src/api/<nome>/migrations/;
15. Definição do arquivo <nome>.model.ts: O arquivo deve ser composto de uma entidade, um model para operações de mapper que utilize src/core/utils/json.util.ts para serialização e deserialização de jsons, uma entidade de request e uma entidade de response;
    15.1 Entidade - Entidade anemica;
    15.2 Model - Métodos de validação e mappers (toJson, fromJson, toEntity, fromEntity, copyWith);
    15.3 Request - Uma request para cada método, se necessário;
    15.4 Response - Um response para cada método, se necessário - Se não retorna apenas a entity;
16. Definição do arquivo <nome>.repository.ts: O Repository deve utilizar o cliente especificado pelo usuário (http ou supabase) via injeção de dependência, e no arquivo deve ter I<nome>Repository e <nome>Repository. Utilize o result como padrão para retornos tratados e se necessário adicione tratamentos de retorno especificos;
17. Definição do arquivo <nome>.service.ts: O service deve implementar o repository via injeção de dependência e se necessário implementar regras de negócio, o arquivo deve ter I<nome>Service e <nome>Service;
18. Definição do arquivo <nome>.handler.ts: O handler deve expor as rotas e deve depender da interface do service, o arquivo deve ter I<nome>Handler e <nome>Handler;
19. Index - Este arquivo deve exportar as classes, deve fazer o binding, e deve ser o ponto de entrada da api;

20. A api deve utilizar o denoJs;
21. A api deve utilizar o src/deps.ts para importação de pacotes externos;
22. A api deve ser desenvolvida para o Edge Functions do Supabase;
23. Documentações obrigatórias da API:
    23.1 - Collection: deve ser criada em src/api/<nome>/docs/<nome>.collection.json;
    23.2 - Swagger: deve ser criada em src/api/<nome>/docs/<nome>.swagger.ts;
    23.3 - Scalar: deve ser criada em src/api/<nome>/docs/<nome>.scalar.ts;
    23.4 - Regras de documentação:
        23.4.1 - A documentação deve ser abrangente, completa, detalhada;
        23.4.2 - A documentação deve apresentar um overwiew do serviço e cada endpoint deve ter uma apresentação do que faz, e exemplo de uso, exemplo de todos os retornos
        23.4.3 - A documentação deve ser acessível em /swagger, /scalar e /collection, diretamente na rota da api, portanto deve ter métodos especificos para cada documentação;
        23.4.4 - Utilize core/openapi/ como arquivos base para construir a documentação do serviço;
    24. utilize o arquivo src/core/infra/configs/ para carregar as variaveis de ambiente que deve ser utilizadas no repository.
    


## Scripts utilitários:
    - Scripts utilitário devem ser criados para permitir a gestão, testes, deploy, etc...
    - os cripts devem ser criados em src/api/<nome>/scripts/;
    - `deploy.script` (raiz): script centralizado que recebe o nome do modulo e, com
  `--deploy` ou `--migrations`, executa fmt/lint/check, aplica a migration mais
  recente e (quando aplicável) publica a function no Supabase.
    - `src/api/<nome>/task.ts`: aceita `--deploy` e `--migrations`; em ambos os
  casos delega para `./deploy.script <nome> <flag>`. Sem flags, aplica o
  middleware de logs e levanta `Deno.serve` na porta padrao (libera a porta se
  ocupada).
    - Recebe `<modulo>` e a flag (`--deploy` ou `--migrations`).
    - Calcula `MODULE_DIR`, `MIGRATIONS_DIR`, prepara diretório temporário,
    - copia `src`, `deno.json` e `deno.lock` (se existir).
    - Executa `deno fmt --check src`, `deno lint src` e `deno check` nos
    - arquivos principais do módulo (`index.ts`, `task.ts`).
    - Localiza a migration mais recente (`*.sql`) do módulo, copia para
    - `supabase/migrations/<timestamp>__<modulo>.sql`.
    - Caso `SUPABASE_PROJECT_ID` esteja definido, roda `supabase link`.
    - Executa `supabase db push` (tratando o aviso de migrations ja aplicadas).
    - Quando a flag for `--deploy`, gera `supabase/functions/<modulo>/index.ts`
      apontando para `<camelCase>Fetch` e roda `supabase functions deploy`.
    - A CLI espera comandos como:
      - `deno task <modulo> --deploy` (checks + migrations + deploy).
      - `deno task <modulo>` (servidor local).
      - `deno task migrations` (copia migrations novas e executa
        `supabase db push` para todos os modulos).
    - Atualize `deno.json` adicionando a task `${nome}` no formato:

    ```json
    "${nome}": "deno run --allow-env --allow-net --allow-read --allow-run --env-file=.env ./src/api/${nome}/task.ts"
    ```

## CI/CD
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

## Regras gerais

    - Comentarios/doc: cada classe e metodo principal deve conter comentarios em
     portugues BR sem acentos e blocos `Exemplo de uso`.
    - Sempre utilize o helper `result` para retorno de sucesso/erro em
     repositorio, servico e handler.
    - Repositorio:
        - Se o backend for `supabase`, use `SupabaseClientFactory` /
       `SupabaseClientProvider` (barrel `src/core/infra/index.ts`).
        - Para `http`, use o cliente correspondente em `src/core/infra/http/` (crie
       stubs se necessario).
    - Middleware de logs: `index.ts` e `task.ts` devem sempre aplicar
     `createLoggerMiddleware`.

## Checagem

- Garanta que barrels (`index.ts`) existam em cada pasta.
- Validate `deno check` nos arquivos principais.
- Confirme que imports utilizam apenas os barrels (`../../core/index.ts`, etc.).
- Assegure que `deno task <nome>` levanta a API local e
  `deno task <nome> --deploy` roda o script de deploy.
