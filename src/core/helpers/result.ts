/**
 * Implementacao do padrao Result para sucesso/erro tipado.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

/** Resultado discriminado de uma operacao. */
export type Result<T, E> = Success<T, E> | Failure<T, E>;

/** Representa um sucesso com valor T. */
class Success<T, E> {
  readonly ok = true as const;
  constructor(readonly value: T) {}
}

/** Representa uma falha com valor E. */
class Failure<T, E> {
  readonly ok = false as const;
  constructor(readonly value: E) {}
}

/**
 * Manipulador com helpers de type guard e acesso aos valores.
 * Exemplo de uso:
 * ```ts
 * const r = result.Success<number, Error>(42);
 * if (r.isSuccess()) {
 *   const v = r.SuccessValue();
 * }
 * ```
 */
export class ResultHandler<T, E> {
  constructor(readonly inner: Result<T, E>) {}

  /** Type guard para sucesso. */
  isSuccess(): this is ResultHandler<T, E> & { inner: Success<T, E> } {
    return (this.inner as Success<T, E>).ok === true;
  }

  /** Type guard para erro. */
  isError(): this is ResultHandler<T, E> & { inner: Failure<T, E> } {
    return (this.inner as Failure<T, E>).ok === false;
  }

  /** Retorna o valor bruto (T | E). */
  Value(): T | E {
    return this.inner.value as T | E;
  }

  /** Retorna T ou lanca se estiver em falha. */
  SuccessValue(): T {
    if (!this.isSuccess()) {
      throw new Error("Result em estado de erro ao acessar SuccessValue");
    }
    return this.inner.value as T;
  }

  /** Retorna E ou lanca se estiver em sucesso. */
  ErrorValue(): E {
    if (!this.isError()) {
      throw new Error("Result em estado de sucesso ao acessar ErrorValue");
    }
    return this.inner.value as E;
  }

  /** Desempacota e retorna o Result original. */
  unwrap(): Result<T, E> {
    return this.inner;
  }
}

/**
 * Fabricas para criar e manipular Result.
 *
 * Exemplo de uso:
 * ```ts
 * const ok = result.Success<number, string>(1);
 * const err = result.Error<number, string>("x");
 * const same = result.from(ok.unwrap());
 * ```
 */
export const result = {
  /** Cria um sucesso e retorna um handler. */
  Success<T, E = never>(value: T): ResultHandler<T, E> {
    return new ResultHandler<T, E>(new Success<T, E>(value));
  },

  /** Cria um erro e retorna um handler. */
  Error<T = never, E = unknown>(value: E): ResultHandler<T, E> {
    return new ResultHandler<T, E>(new Failure<T, E>(value));
  },

  /** Encapsula um Result existente em um handler. */
  from<T, E>(state: Result<T, E>): ResultHandler<T, E> {
    return new ResultHandler<T, E>(state);
  },
};
