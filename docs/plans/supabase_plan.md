# Plano de Desenvolvimento: Módulo Supabase

Este documento detalha o plano de desenvolvimento para o módulo Supabase, conforme solicitado no prompt `7-supabase.md`.

## 1. Configuração (`supabase_config.ts`)

- **Local:** `src/core/infra/supabase/supabase_config.ts`
- **Tarefa:** Definir a interface `SupabaseConfig` para a configuração do cliente, com documentação JSDoc e exemplos.

## 2. Cliente Supabase (`supabase_client.ts`)

- **Local:** `src/core/infra/supabase/supabase_client.ts`
- **Interface:** Definir a interface `SupabaseClientProvider` para a factory.
- **Carregamento de Configuração:** Implementar a função `loadSupabaseConfigFromEnv` para carregar e validar as configurações a partir das variáveis de ambiente.
- **Factory:** Criar a classe `SupabaseClientFactory` para encapsular a lógica de criação e cache de instâncias do `SupabaseClient`.
- **Helpers:** Desenvolver as funções auxiliares `selectAccessKey` e `readEnv`.

## 3. Barrel Exports (`index.ts`)

- **Local:** `src/core/infra/supabase/index.ts`
- **Tarefa:** Criar um arquivo `index.ts` para centralizar e reexportar todas as interfaces e funções públicas do módulo.

## 4. Integração

- **Local:** `src/core/infra/index.ts`
- **Tarefa:** Atualizar o barrel da camada de infraestrutura para exportar também o novo módulo Supabase.

## 5. Padrões e Qualidade

- O código seguirá todos os padrões de qualidade e estilo do projeto, com comentários em português (sem acentos) e verificação de tipos ao final.
