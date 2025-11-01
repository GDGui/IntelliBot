/**
 * @file Fabrica de erros HTTP padronizados para a camada de API.
 */

import type { AppError } from './errors.ts';
import { createAppError, normalizeAppError } from './errors.ts';

/**
 * @interface ApiErrorOptions
 * @description Opcoes para a criacao de um erro de API, permitindo
 * sobrescrever o codigo e adicionar detalhes ou causa.
 *
 * @property {string} [code] - Permite sobrescrever o codigo de erro padrao.
 * @property {Record<string, unknown>} [details] - Detalhes estruturados sobre o erro.
 * @property {unknown} [cause] - A causa original do erro.
 */
export interface ApiErrorOptions {
	code?: string;
	details?: Record<string, unknown>;
	cause?: unknown;
}

/**
 * @class ApiErrors
 * @description Classe com metodos estaticos para gerar AppErrors correspondentes
 * a status HTTP comuns.
 */
export class ApiErrors {
	/**
	 * Metodo privado para centralizar a criacao de erros.
	 */
	private static create(
		defaultCode: string,
		status: number,
		message: string,
		options?: ApiErrorOptions,
	): AppError {
		return createAppError(options?.code ?? defaultCode, message, {
			status,
			details: options?.details,
			cause: options?.cause,
		});
	}

	/**
	 * Gera um erro para requisicoes invalidas (400 Bad Request).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.badRequest('O campo "email" e invalido.');
	 */
	static badRequest(message: string, options?: ApiErrorOptions): AppError {
		return this.create('BAD_REQUEST', 400, message, options);
	}

	/**
	 * Gera um erro para requisicoes nao autorizadas (401 Unauthorized).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.unauthorized('Token de acesso invalido ou expirado.');
	 */
	static unauthorized(message: string, options?: ApiErrorOptions): AppError {
		return this.create('UNAUTHORIZED', 401, message, options);
	}

	/**
	 * Gera um erro para acesso proibido (403 Forbidden).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.forbidden('Voce nao tem permissao para acessar este recurso.');
	 */
	static forbidden(message: string, options?: ApiErrorOptions): AppError {
		return this.create('FORBIDDEN', 403, message, options);
	}

	/**
	 * Gera um erro para recurso nao encontrado (404 Not Found).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.notFound('O produto com o ID 123 nao foi encontrado.');
	 */
	static notFound(message: string, options?: ApiErrorOptions): AppError {
		return this.create('NOT_FOUND', 404, message, options);
	}

	/**
	 * Gera um erro para conflito de estado (409 Conflict).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.conflict('Ja existe um usuario com este email.');
	 */
	static conflict(message: string, options?: ApiErrorOptions): AppError {
		return this.create('CONFLICT', 409, message, options);
	}

	/**
	 * Gera um erro para entidade improcessavel (422 Unprocessable Entity).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.unprocessableEntity('Os dados fornecidos nao puderam ser processados.');
	 */
	static unprocessableEntity(
		message: string,
		options?: ApiErrorOptions,
	): AppError {
		return this.create('UNPROCESSABLE_ENTITY', 422, message, options);
	}

	/**
	 * Gera um erro interno do servidor (500 Internal Server Error).
	 * @param {string} message - A mensagem de erro.
	 * @param {ApiErrorOptions} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.internal('Ocorreu uma falha inesperada no servidor.');
	 */
	static internal(message: string, options?: ApiErrorOptions): AppError {
		return this.create('INTERNAL_SERVER_ERROR', 500, message, options);
	}

	/**
	 * Gera um erro customizado.
	 * @param {string} code - Codigo do erro.
	 * @param {number} status - Status HTTP.
	 * @param {string} message - A mensagem de erro.
	 * @param {Omit<ApiErrorOptions, 'code'>} [options] - Opcoes adicionais.
	 * @returns {AppError}
	 *
	 * @example
	 * return ApiErrors.custom('CUSTOM_ERROR', 418, 'Eu sou um bule de cha.');
	 */
	static custom(
		code: string,
		status: number,
		message: string,
		options?: Omit<ApiErrorOptions, 'code'>,
	): AppError {
		return createAppError(code, message, { status, ...options });
	}

	/**
	 * Normaliza um erro desconhecido para um AppError de API.
	 * @param {unknown} error - O erro a ser normalizado.
	 * @param {Partial<AppError>} [fallback] - Valores padrao para o caso de o erro nao ser um AppError.
	 * @returns {AppError}
	 *
	 * @example
	 * try {
	 *   // ...
	 * } catch (err) {
	 *   const apiError = ApiErrors.fromUnknown(err);
	 *   // Retorna um erro 500 padronizado
	 * }
	 */
	static fromUnknown(
		error: unknown,
		fallback?: Partial<AppError>,
	): AppError {
		return normalizeAppError(error, {
			code: fallback?.code ?? 'INTERNAL_SERVER_ERROR',
			message: fallback?.message ?? 'Erro inesperado no servidor.',
			status: fallback?.status ?? 500,
			details: fallback?.details,
		});
	}
}
