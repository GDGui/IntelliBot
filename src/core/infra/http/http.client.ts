// src/core/infra/http/http.client.ts

import { result, Result } from "../../helpers/result.ts";
import { AppError, createAppError } from "../../helpers/errors.ts";

// Tipos e Interfaces

/**
 * @enum HttpMethod
 * @description Metodos HTTP suportados.
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * @interface HttpRequest
 * @description Representa uma requisicao HTTP.
 * 
 * @property {string} url - A URL da requisicao.
 * @property {HttpMethod} method - O metodo HTTP.
 * @property {Record<string, string>} [headers] - Cabecalhos da requisicao.
 * @property {unknown} [body] - Corpo da requisicao.
 * @property {Record<string, string>} [params] - Parametros de query.
 */
export interface HttpRequest {
  url: string;
  method: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
}

/**
 * @interface HttpResponse
 * @description Representa uma resposta HTTP.
 * 
 * @property {T} data - Os dados da resposta.
 * @property {number} status - O status da resposta.
 * @property {Record<string, string>} headers - Cabecalhos da resposta.
 */
export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * @interface AuthOptions
 * @description Opcoes de autenticacao.
 * 
 * @property {"bearer"} type - O tipo de autenticacao.
 * @property {string} token - O token de autenticacao.
 */
export interface AuthOptions {
  type: "bearer";
  token: string;
}

/**
 * @interface HttpClient
 * @description Define a interface para um cliente HTTP.
 */
export interface HttpClient {
  request<T>(req: HttpRequest): Promise<Result<HttpResponse<T>, AppError>>;
  get<T>(url: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<Result<HttpResponse<T>, AppError>>;
  post<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<Result<HttpResponse<T>, AppError>>;
  put<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<Result<HttpResponse<T>, AppError>>;
  patch<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<Result<HttpResponse<T>, AppError>>;
  delete<T>(url: string, headers?: Record<string, string>): Promise<Result<HttpResponse<T>, AppError>>;
  authenticate(options: AuthOptions): void;
}

// Helpers

function buildUrl(url: string, params?: Record<string, string>): string {
  if (!params) return url;
  const urlParams = new URLSearchParams(params);
  return `${url}?${urlParams.toString()}`;
}

function parseBody(body?: unknown): BodyInit | null {
  if (!body) return null;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
}

function buildAuthHeader(authOptions?: AuthOptions): Record<string, string> {
  if (!authOptions) return {};
  return { Authorization: `Bearer ${authOptions.token}` };
}

// HttpClient

/**
 * @function createHttpClient
 * @description Cria um cliente HTTP.
 * @returns {HttpClient} - Uma instancia de HttpClient.
 */
export function createHttpClient(): HttpClient {
  let authOptions: AuthOptions | undefined;

  async function request<T>(req: HttpRequest): Promise<Result<HttpResponse<T>, AppError>> {
    try {
      const url = buildUrl(req.url, req.params);
      const body = parseBody(req.body);
      const authHeader = buildAuthHeader(authOptions);
      const headers = { "Content-Type": "application/json", ...authHeader, ...req.headers };

      const response = await fetch(url, {
        method: req.method,
        headers,
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        return result.Error(createAppError("HTTP_ERROR", data.message || "Erro na requisicao HTTP", { status: response.status, details: data })).unwrap();
      }

      return result.Success({
        data,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      }).unwrap();

    } catch (e) {
      return result.Error(createAppError("HTTP_CLIENT_ERROR", e.message, { cause: e })).unwrap();
    }
  }

  return {
    request,
    get: <T>(url: string, params?: Record<string, string>, headers?: Record<string, string>) =>
      request<T>({ url, method: "GET", params, headers }),
    post: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
      request<T>({ url, method: "POST", body, headers }),
    put: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
      request<T>({ url, method: "PUT", body, headers }),
    patch: <T>(url: string, body: unknown, headers?: Record<string, string>) =>
      request<T>({ url, method: "PATCH", body, headers }),
    delete: <T>(url: string, headers?: Record<string, string>) =>
      request<T>({ url, method: "DELETE", headers }),
    authenticate: (options: AuthOptions) => {
      authOptions = options;
    },
  };
}
