# Objetivo

Padronizar o estilo de implementacao para agentes que colaborarem no projeto,
garantindo consistencia nas camadas de dominio, helpers e integracoes.

# Diretrizes Gerais

1. **Arquitetura**
   - Respeite a separacao em `domain`, `data`, `presenter`, mantendo dependencia
     unidirecional (dominio independente).
   - Reutilize os contratos e helpers ja existentes (`result`, `errors`,
     serviços) antes de criar novas estruturas.

2. **Uso do helper `result`**
   - Always utilize `result.Success<T, E>(...)`, `result.Error<T, E>(...)` e
     `result.from(...)`.
   - Para acessar valores, use `ResultHandler` (`.isSuccess()`, `.isError()`,
     `.SuccessValue()`, `.ErrorValue()`, `.Value()`).
   - Nunca trabalhe diretamente com `Success`/`Failure`; mantenha encapsulado.

3. **Erros e Excecoes**
   - Crie novos erros via `createAppError` com codigos semanticos.
   - Utilize `ApiErrors` na camada presenter; no dominio, apenas `AppError`.
   - Jamais lance excecoes cruas; retorne `Result` com erro.

4. **Servicos e Repositorios**
   - Interfaces residem em `domain/repositories` e retornam
     `Promise<Result<...>>`.
   - Servicos de dominio (`domain/services`) realizam validacoes e delegam ao
     repositorio usando `await`.

5. **Documentacao**
   - Comentarios em portugues brasileiro, sem acentos (ASCII).
   - Forneca blocos `Exemplo de uso` em cada metodo relevante.

6. **Nomenclatura de arquivos**
   - Use `_` apenas quando o nome for composto (`admin_user`). Utilize `.` para
     indicar tipo/conceito (`product.model.ts`, `product.datasource.ts`).
   - Interfaces devem iniciar com `I` (ex.: `IProductRepository`,
     `IProductDatasource`).
   - Datasources devem refletir a entidade (ex.: `product.datasource.ts` com
     `IProductDatasource` e `ProductDatasource`).

7. **Barrels e imports**
   - Cada pacote deve expor um `index.ts`; utilize somente os barrels para
     importar (ex.: `import { Product } from "../../domain";`).
   - Reexporte dependencias externas via `src/deps.ts`; nao importe modulo
     externo diretamente em arquivos de feature.

8. **Prompts**
   - Sempre atualize ou adicione prompts em `docs/prompts/` para instruir
     reproducao do codigo criado.

# Checagem Final

- Garanta que `deno check` execute sem erros nos arquivos alterados.
- Confirme que nenhum import ciclico foi introduzido.
- Valide que os prompts refletem qualquer mudanca estrutural realizada.
