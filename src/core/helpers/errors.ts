/**
 * @file Define o sistema de erros padronizados da aplicacao.
 */

/**
 * @interface AppError
 * @description Contrato para erros padronizados da aplicacao, garantindo
 * consistencia no tratamento de excecoes.
 *
 * @property {string} code - Codigo unico que identifica o tipo de erro (ex: 'USER_NOT_FOUND').
 * @property {string} message - Mensagem descritiva do erro, para fins de logging e debug.
 * @property {number} [status] - Codigo de status HTTP associado ao erro (ex: 404, 500).
 * @property {unknown} [cause] - A causa original do erro, util para rastrear a origem de excecoes.
 * @property {Record<string, unknown>} [details] - Objeto para informacoes adicionais e estruturadas sobre o erro.
 */
export interface AppError {
	code: string;
	message: string;
	status?: number;
	cause?: unknown;
	details?: Record<string, unknown>;
}

/**
 * @interface AppErrorOptions
 * @description Opcoes para a criacao de um AppError.
 *
 * @property {number} [status] - Codigo de status HTTP.
 * @property {unknown} [cause] - Causa original do erro.
 * @property {Record<string, unknown>} [details] - Detalhes adicionais.
 */
export interface AppErrorOptions {
	status?: number;
	cause?: unknown;
	details?: Record<string, unknown>;
}

/**
 * @interface NormalizeAppErrorOptions
 * @description Opcoes para a normalizacao de um erro, estendendo AppErrorOptions
 * com a possibilidade de sobrescrever codigo e mensagem.
 */
export interface NormalizeAppErrorOptions extends AppErrorOptions {
	code?: string;
	message?: string;
}

/**
 * Cria um objeto de erro padronizado da aplicacao.
 *
 * @param {string} code - O codigo unico para o erro.
 * @param {string} message - A mensagem descritiva do erro.
 * @param {AppErrorOptions} [options] - Opcoes adicionais como status, causa e detalhes.
 * @returns {AppError} O objeto de erro padronizado.
 *
 * @example
 * // Criar um erro simples
 * const meuErro = createAppError('VALIDATION_FAILED', 'Os dados fornecidos sao invalidos.');
 *
 * // Criar um erro com detalhes e status HTTP
 * const erroDetalhado = createAppError('USER_NOT_FOUND', 'Usuario nao encontrado.', {
 *   status: 404,
 *   details: { userId: '123' }
 * });
 */
export function createAppError(
	code: string,
	message: string,
	options?: AppErrorOptions,
): AppError {
	return {
		code,
		message,
		...options,
	};
}

/**
 * Verifica se um valor é um AppError.
 *
 * @param {unknown} value - O valor a ser verificado.
 * @returns {value is AppError} Verdadeiro se o valor se conformar a interface AppError.
 *
 * @example
 * if (isAppError(caughtError)) {
 *   console.error(caughtError.code, caughtError.message);
 * }
 */
export function isAppError(value: unknown): value is AppError {
	return (
		typeof value === 'object' &&
		value !== null &&
		'code' in value &&
		'message' in value
	);
}

/**
 * Normaliza um valor desconhecido para um formato AppError.
 * Se o valor ja for um AppError, ele e retornado. Caso contrario,
 * um novo AppError e criado com base no valor e nas opcoes fornecidas.
 *
 * @param {unknown} input - O valor a ser normalizado.
 * @param {NormalizeAppErrorOptions} [options] - Opcoes para a criacao do novo AppError,
 * caso o input nao seja um.
 * @returns {AppError} O erro normalizado.
 *
 * @example
 * try {
 *   // algum codigo que pode falhar
 * } catch (error) {
 *   const appError = normalizeAppError(error, {
 *     code: 'UNEXPECTED_PAYMENT_ERROR',
 *     message: 'Falha ao processar pagamento.',
 *     status: 500
 *   });
 *   // usar appError
 * }
 */
export function normalizeAppError(
	input: unknown,
	options?: NormalizeAppErrorOptions,
): AppError {
	if (isAppError(input)) {
		return input;
	}

	return createAppError(
		options?.code ?? 'UNKNOWN_ERROR',
		options?.message ?? 'Erro nao tratado',
		{
			status: options?.status,
			details: options?.details,
			cause: input,
		},
	);
}
