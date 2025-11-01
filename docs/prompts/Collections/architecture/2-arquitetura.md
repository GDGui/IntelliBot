# Visao Geral

O backend segue principios de Clean Architecture aliados a DDD. O nucleo do
dominio permanece independente, enquanto camadas externas fazem adaptacao para
infra ou interfaces. O objetivo e permitir crescimento modular, com multiplas
front-doors (API tradicional, Supabase Functions, jobs) reutilizando a mesma
logica de negocio.

# Camada Domain (`src/api/products/domain`)

- **Entities**: definem contratos de negocio (ex.: `Product`). Devem evoluir
  para representar invariantes, value objects e regras proprias.
- **Repositories**: expõem interfaces (ex.: `IProductsRepository`) que descrevem
  como o dominio interage com persistencia. Nenhuma dependencia concreta aparece
  aqui.
- **Services/Use Cases**: concentrarao fluxos de aplicacao (validacoes, regras
  compostas) consumindo apenas os contratos do dominio.

Essa camada nao referencia dados externos. Qualquer mudanca de infra deve ser
absorvida pelas camadas adjacentes, mantendo o dominio estavel.

# Camada Data (`src/api/products/data`)

- **Datasource / Model / Mapper**: implemetacoes concretas que atendem os
  contratos do dominio. Podem usar Supabase, Postgres direto, caches ou mocks.
- Converte payloads externos para entidades do dominio e vice-versa.
- Mantem dependencias direcionadas para fora (infra), nunca para dentro do
  dominio.

# Camada Presenter (`src/api/products/presenter`)

- **API**: controladores/handlers para exposicao via HTTP tradicional (ex.:
  frameworks, Edge Functions adaptadas).
- **Function**: adaptadores dedicados a FaaS (Supabase, Cloudflare etc.),
  importando os mesmos casos de uso do dominio.
- Faz orquestracao de entrada/saida (validacao, serializacao) sem implementar
  regra de negocio.

# Camada Core (`src/core`)

- **Helpers**: utilitarios compartilhados entre modulos (ex.: `result`), sempre
  genericos e livres de dependencias especificas.
- Pode hospedar configuracoes, middlewares ou cross-cutting concerns
  reutilizaveis.

# Camada Docs/Prompts (`docs`, `docs/prompts`, `prompts`)

- Documentacao operacional e prompts para agentes automatizados, garantindo
  reproducao de helpers e estruturas (ex.: `docs/prompts/result.md`,
  `prompts/setup_arquitetural_1.md`).
- Ajuda a padronizar praticas de engenharia e facilita onboarding rapido de
  novos contribuidores.

# Fluxo de Dependencias

1. Presenter injeta casos de uso do dominio.
2. Casos de uso consomem interfaces de repositorio/servicos definidos no
   dominio.
3. Camada data implementa essas interfaces conversando com a infraestrutura
   (Supabase e outros providers).
4. Core oferece utilitarios compartilhados, sempre consumidos de fora para
   dentro.

Esse desenho garante substituicao de qualquer camada externa sem alterar o
nucleo do dominio, reforcando separacao de responsabilidades e testabilidade.
