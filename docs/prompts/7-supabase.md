# Objetivo

Recriar o pacote `src/core/infrastructure/supabase` contendo configuracao,
client e barrel exports exatamente como definidos atualmente, mantendo
comentarios em portugues brasileiro sem acentuacao e exemplos de uso.

# Estrutura Necessaria

- `src/core/infrastructure/supabase/supabase_config.ts`
- `src/core/infrastructure/supabase/supabase_client.ts`
- `src/core/infrastructure/supabase/index.ts`

# Instrucao

1. Crie a pasta `src/core/infrastructure/supabase/` caso nao exista.
2. No arquivo `supabase_config.ts`:
   - Defina a interface `SupabaseConfig` com campos `url`, `anonKey?`,
     `serviceRoleKey?`.
   - Adicione comentario JSDoc explicando o proposito da interface e incluindo
     bloco `Exemplo de uso` em ASCII.
3. No arquivo `supabase_client.ts`:
   - Importe `createClient`, `SupabaseClient` e `nodeProcess` a partir de
     `../../../deps.ts` (ajuste o caminho relativo conforme estrutura real).
   - Defina constantes das variaveis de ambiente `SUPABASE_URL`,
     `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   - Exporte a interface `SupabaseClientProvider` com metodos `getClient()` e
     `withConfig(...)`, acompanhados de comentario com exemplo.
   - Implemente a funcao `loadSupabaseConfigFromEnv()` que:
     - Usa helper interno `readEnv` (compatível com `Deno.env` e
       `nodeProcess.env`).
     - Valida URL obrigatoria e ao menos uma chave (`anonKey` ou
       `serviceRoleKey`), lançando `Error` com mensagens ASCII.
     - Retorna objeto `SupabaseConfig`.
     - Inclua comentario JSDoc e exemplo.
   - Crie a classe `SupabaseClientFactory`:
     - Guarda configuracao e cache de `SupabaseClient`.
     - Metodo `getClient()` cria/salva instancia usando
       `createClient(url, accessToken, { auth: { persistSession: false, detectSessionInUrl: false } })`,
       selecionando token via helper `selectAccessKey`.
     - Metodo `withConfig` retorna nova fabrica com configuracao mesclada.
     - Adicione comentarios e blocos `Exemplo de uso`.
   - Implemente helpers `selectAccessKey` e `readEnv` com tratamento ASCII (sem
     acentos).
4. No arquivo `index.ts`:
   - Adicione comentario no topo informando que centraliza exportacoes.
   - Reexporte `SupabaseConfig`, `loadSupabaseConfigFromEnv`,
     `SupabaseClientFactory` e o tipo `SupabaseClientProvider` usando
     `export`/`export type` a partir de `./supabase_client.ts`.
5. Garanta que todos os comentarios estejam em portugues brasileiro sem
   acentuacao e que os exemplos estejam em blocos ```ts.

# Checagem

- Verifique que os tres arquivos existem e os imports relativos usam sufixo
  `.ts`.
- Confirme que `SupabaseClientFactory` utiliza `createClient` com opcoes de auth
  corretas e que `selectAccessKey` exige anonKey ou serviceRoleKey.
- Assegure que `readEnv` lida com `Deno.env` e `process.env` e que nenhum
  caractere fora ASCII esteja presente.
