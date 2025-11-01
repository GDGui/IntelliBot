/**
 * @file Implementa o Result Monad para tratamento de sucesso/falha sem exceptions.
 */

import { AppError } from './errors.ts';

// deno-lint-ignore no-explicit-any
class Success<T, E> {
	public readonly ok = true;
	public readonly value: T;

	constructor(value: T) {
		this.value = value;
	}
}

// deno-lint-ignore no-explicit-any
class Failure<T, E> {
	public readonly ok = false;
	public readonly value: E;

	constructor(value: E) {
		this.value = value;
	}
}

export type Result<T, E> = Success<T, E> | Failure<T, E>;

/**
 * @class ResultHandler
 * @description Uma classe wrapper para manipular objetos Result de forma segura e fluente.
 *
 * @template T O tipo do valor de sucesso.
 * @template E O tipo do valor de erro.
 */
export class ResultHandler<T, E> {
	private constructor(private readonly state: Result<T, E>) {}

	/**
	 * Verifica se o resultado e um sucesso.
	 * Atua como um type guard para o compilador.
	 * @returns {boolean}
	 *
	 * @example
	 * const meuResultado = result.Success(10);
	 * if (meuResultado.isSuccess()) {
	 *   // O compilador sabe que meuResultado.SuccessValue() e seguro
	 *   const valor = meuResultado.SuccessValue(); // valor e 10
	 * }
	 */
	public isSuccess(): this is { unwrap(): Success<T, E> } {
		return this.state.ok;
	}

	/**
	 * Verifica se o resultado e um erro.
	 * Atua como um type guard para o compilador.
	 * @returns {boolean}
	 *
	 * @example
	 * const meuResultado = result.Error({ code: 'FALHA', message: 'Algo deu errado' });
	 * if (meuResultado.isError()) {
	 *   // O compilador sabe que meuResultado.ErrorValue() e seguro
	 *   const erro = meuResultado.ErrorValue();
	 * }
	 */
	public isError(): this is { unwrap(): Failure<T, E> } {
		return !this.state.ok;
	}

	/**
	 * Retorna o valor de sucesso ou de erro.
	 * @returns {T | E}
	 */
	public Value(): T | E {
		return this.state.value;
	}

	/**
	 * Retorna o valor de sucesso.
	 * Lanca um erro se o estado for de falha. Use apos verificar com `isSuccess()`.
	 * @returns {T}
	 */
	public SuccessValue(): T {
		if (this.isError()) {
			throw new Error(
				'Nao e possivel obter SuccessValue de um resultado de Erro.',
			);
		}
		return (this.state as Success<T, E>).value;
	}

	/**
	 * Retorna o valor de erro.
	 * Lanca um erro se o estado for de sucesso. Use apos verificar com `isError()`.
	 * @returns {E}
	 */
	public ErrorValue(): E {
		if (this.isSuccess()) {
			throw new Error(
				'Nao e possivel obter ErrorValue de um resultado de Sucesso.',
			);
		}
		return (this.state as Failure<T, E>).value;
	}

	/**
	 * Retorna o objeto Result original (Success ou Failure).
	 * @returns {Result<T, E>}
	 */
	public unwrap(): Result<T, E> {
		return this.state;
	}

	/**
	 * Cria um ResultHandler a partir de um estado Success ou Failure.
	 * @param {Result<T, E>} state - O estado inicial.
	 * @returns {ResultHandler<T, E>}
	 *
	 * @example
	 * const sucesso = new Success(123);
	 * const handler = ResultHandler.from(sucesso);
	 */
	public static from<T, E>(state: Result<T, E>): ResultHandler<T, E> {
		return new ResultHandler(state);
	}
}

/**
 * Objeto factory para criar instancias de ResultHandler de forma conveniente.
 */
export const result = {
	/**
	 * Cria um ResultHandler representando um sucesso.
	 * @template T O tipo do valor de sucesso.
	 * @template E O tipo do valor de erro (nunca ocorrera aqui).
	 * @param {T} value - O valor de sucesso.
	 * @returns {ResultHandler<T, E>}
	 *
	 * @example
	 * const sucesso = result.Success({ id: 1, nome: 'Usuario' });
	 */
	Success<T, E = never>(value: T): ResultHandler<T, E> {
		return ResultHandler.from<T, E>(new Success(value));
	},

	/**
	 * Cria um ResultHandler representando um erro.
	 * @template T O tipo do valor de sucesso (nunca ocorrera aqui).
	 * @template E O tipo do valor de erro.
	 * @param {E} value - O valor do erro.
	 * @returns {ResultHandler<T, E>}
	 *
	 * @example
	 * const erro = result.Error({ code: 'NOT_FOUND', message: 'Nao encontrado' });
	 */
	Error<T = never, E = AppError>(value: E): ResultHandler<T, E> {
		return ResultHandler.from<T, E>(new Failure(value));
	},

	/**
	 * Encapsula um objeto Result (Success ou Failure) existente em um ResultHandler.
	 * @template T O tipo do valor de sucesso.
	 * @template E O tipo do valor de erro.
	 * @param {Result<T, E>} state - O objeto Result a ser encapsulado.
	 * @returns {ResultHandler<T, E>}
	 *
	 * @example
	 * const estadoBruto = new Success(42);
	 * const resultado = result.from(estadoBruto);
	 */
	from<T, E>(state: Result<T, E>): ResultHandler<T, E> {
		return ResultHandler.from(state);
	},
};