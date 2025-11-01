# Backlog de Desenvolvimento: Feature de Helpers (`src/core/helpers`)

**Contexto Arquitetural:** O projeto utiliza uma arquitetura limpa (Clean Architecture) com Deno. Esta feature é fundamental e servirá como base para o tratamento de erros e resultados em toda a aplicação, alinhada com os princípios de programação funcional e segurança de tipos. O objetivo é evitar o lançamento de exceções para erros de negócio previsíveis, utilizando um `Result Monad`.

**Diretrizes Gerais para o Agente:**
- Siga a ordem das Epics e Tarefas para garantir que as dependências sejam resolvidas corretamente.
- Todo o código deve ser escrito em TypeScript para Deno.
- Todos os comentários de documentação (JSDoc) devem ser em português brasileiro, utilizando apenas caracteres ASCII (sem acentos ou cedilha).
- Cada função ou método público exportado deve conter um bloco de comentário JSDoc com uma descrição e um bloco `@example` demonstrando seu uso.
- As importações e exportações devem seguir o padrão ES Modules.
- Ao final, um "barrel file" (`index.ts`) deve ser criado para centralizar as exportações do módulo.

---

### Epic 1: Implementar o Núcleo de Erros da Aplicação

**Objetivo:** Criar um sistema padronizado para a representação de erros de aplicação (`AppError`).

**Caminho do arquivo:** `src/core/helpers/errors.ts`

- **Tarefa 1.1: Definir Interfaces de Erro**
  - Crie a interface `AppError` com os campos: `code: string`, `message: string`, `status?: number`, `cause?: unknown`, `details?: Record<string, any>`.
  - Crie a interface `AppErrorOptions` com os campos: `status?: number`, `cause?: unknown`, `details?: Record<string, any>`.
  - Crie a interface `NormalizeAppErrorOptions` que estende `AppErrorOptions` e adiciona `code?: string` e `message?: string`.

- **Tarefa 1.2: Implementar a Factory `createAppError`**
  - Crie e exporte a função `createAppError(code: string, message: string, options?: AppErrorOptions): AppError`.
  - A função deve retornar um objeto que implementa a interface `AppError`.
  - Adicione JSDoc com descrição e exemplo de uso.

- **Tarefa 1.3: Implementar o Type Guard `isAppError`**
  - Crie e exporte a função `isAppError(value: unknown): value is AppError`.
  - A função deve verificar se o `value` é um objeto e possui as propriedades `code` and `message`.
  - Adicione JSDoc com descrição e exemplo de uso.

- **Tarefa 1.4: Implementar o Normalizador `normalizeAppError`**
  - Crie e exporte a função `normalizeAppError(input: unknown, options?: NormalizeAppErrorOptions): AppError`.
  - Se `isAppError(input)` for verdadeiro, retorne `input`.
  - Caso contrário, use `createAppError` para encapsular o `input` em um `AppError` padrão, utilizando os `options` fornecidos ou valores default (`code: 'UNKNOWN_ERROR'`, `message: 'Erro nao tratado'`). O `input` original deve ser atribuído à propriedade `cause`.
  - Adicione JSDoc com descrição e exemplo de uso.

---

### Epic 2: Implementar o Result Monad

**Objetivo:** Criar um sistema para manipulação de resultados de sucesso ou falha sem o uso de `throw`.

**Caminho do arquivo:** `src/core/helpers/result.ts`

- **Tarefa 2.1: Definir Tipos e Classes Base**
  - Defina o tipo `Result<T, E>` como uma união: `Success<T, E> | Failure<T, E>`.
  - Implemente a classe interna (não exportada) `Success<T, E>` que armazena um valor de sucesso. Ela deve ter `readonly ok = true` e `readonly value: T`.
  - Implemente a classe interna (não exportada) `Failure<T, E>` que armazena um valor de erro. Ela deve ter `readonly ok = false` e `readonly value: E`.

- **Tarefa 2.2: Implementar o `ResultHandler`**
  - Crie e exporte a classe `ResultHandler<T, E>`.
  - O construtor deve receber um `Result<T, E>`.
  - Implemente os métodos:
    - `isSuccess(): this is { unwrap(): Success<T, E> }` (type guard).
    - `isError(): this is { unwrap(): Failure<T, E> }` (type guard).
    - `Value(): T | E`.
    - `SuccessValue(): T` (deve lançar um erro se `isError()`).
    - `ErrorValue(): E` (deve lançar um erro se `isSuccess()`).
    - `unwrap(): Result<T, E>`.
  - Adicione JSDoc com descrição e exemplos para `isSuccess()` e `isError()`.

- **Tarefa 2.3: Implementar o Objeto `result`**
  - Crie e exporte um objeto constante chamado `result`.
  - Implemente os métodos no objeto:
    - `Success<T, E = never>(value: T): ResultHandler<T, E>`: Cria uma nova instância de `Success` e a encapsula em um `ResultHandler`.
    - `Error<T = never, E = unknown>(value: E): ResultHandler<T, E>`: Cria uma nova instância de `Failure` e a encapsula em um `ResultHandler`.
    - `from<T, E>(state: Result<T, E>): ResultHandler<T, E>`: Encapsula um `Success` ou `Failure` já existente em um `ResultHandler`.
  - Adicione JSDoc com descrição e exemplos para cada método.

---

### Epic 3: Implementar a Fábrica de Erros de API

**Objetivo:** Criar uma classe utilitária para gerar `AppError`s padronizados para a camada de API, correspondentes a status HTTP.

**Caminho do arquivo:** `src/core/helpers/api_errors.ts`

- **Tarefa 3.1: Importar Dependências e Definir Opções**
  - Importe `AppError` (como tipo), `createAppError` e `normalizeAppError` de `./errors.ts`.
  - Defina e exporte a interface `ApiErrorOptions` com os campos: `code?: string`, `details?: Record<string, any>`, `cause?: unknown`.

- **Tarefa 3.2: Implementar a Classe `ApiErrors`**
  - Crie e exporte a classe `ApiErrors`.
  - Implemente um método estático privado `create(defaultCode: string, status: number, message: string, options?: ApiErrorOptions): AppError` que servirá de base para os outros. Ele deve usar `createAppError`, permitindo a sobrescrita do `code` via `options`.

- **Tarefa 3.3: Implementar Métodos Estáticos para Erros HTTP**
  - Para cada erro comum (badRequest, unauthorized, forbidden, notFound, conflict, internal, etc.), crie um método estático que chama o método `create` privado com os parâmetros corretos (código default, status HTTP e mensagem padrão).
  - Exemplo: `static badRequest(message: string, options?: ApiErrorOptions): AppError`.
  - Adicione JSDoc com descrição e exemplo para cada método.

- **Tarefa 3.4: Implementar Métodos Utilitários Adicionais**
  - Crie o método estático `custom(code: string, status: number, message: string, options?: Omit<ApiErrorOptions, 'code'>): AppError`.
  - Crie o método estático `fromUnknown(error: unknown, fallback?: Partial<AppError>): AppError` que utiliza `normalizeAppError` para converter um erro desconhecido em um `AppError` de API, com fallback para um erro 500.
  - Adicione JSDoc com descrição e exemplo para estes métodos.

---

### Epic 4: Centralizar as Exportações (Barrel File)

**Objetivo:** Criar um ponto de entrada único para o módulo de helpers.

**Caminho do arquivo:** `src/core/helpers/index.ts`

- **Tarefa 4.1: Criar o Arquivo `index.ts`**
  - Crie o arquivo `src/core/helpers/index.ts`.
  - Adicione um comentário no topo do arquivo explicando seu propósito (ex: `// Centraliza as exportacoes dos helpers da aplicacao.`).

- **Tarefa 4.2: Reexportar Todos os Símbolos**
  - Use a sintaxe `export { ... } from './file.ts'` e `export type { ... } from './file.ts'` para reexportar tudo o que for necessário dos arquivos `errors.ts`, `result.ts`, e `api_errors.ts`.
  - Garanta que interfaces e tipos sejam exportados com `export type`.

---

### Epic 5: Verificação e Validação

**Objetivo:** Garantir que o código implementado está correto, funcional e alinhado com os padrões do projeto.

- **Tarefa 5.1: Executar `deno check`**
  - Após a criação de todos os arquivos, execute o comando `deno check src/core/helpers/index.ts` para validar os tipos e garantir que não há erros de compilação ou dependências circulares.

- **Tarefa 5.2: Revisão Manual**
  - Revise todos os arquivos para garantir que as diretrizes gerais (comentários em ASCII, exemplos de uso, etc.) foram seguidas.
