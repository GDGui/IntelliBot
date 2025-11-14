/**
 * Cliente HTTP generico baseado em fetch.
 *
 * Comentarios em PT-BR sem acentuacao.
 */

import { createAppError, result } from "../../helpers/index.ts";
import type { AppError, Result } from "../../helpers/index.ts";

/** Metodos HTTP suportados. */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Opcoes de autenticacao suportadas. */
export type AuthOptions = { type: "bearer"; token: string };

/** Requisicao HTTP padrao. */
export interface HttpRequest {
  url?: string; // url completa (sobrepoe baseUrl + path)
  path?: string; // path relativo a baseUrl
  query?: Record<string, string | number | boolean | undefined | null>;
  method: HttpMethod;
  headers?: HeadersInit;
  body?: unknown;
}

/** Resposta HTTP parseada. */
export interface HttpResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  data: T | undefined;
  raw: string | undefined;
}

/** Interface do cliente HTTP. */
export interface HttpClient {
  request<T = unknown>(req: HttpRequest): Promise<Result<HttpResponse<T>, AppError>>;
  get<T = unknown>(pathOrUrl: string, query?: HttpRequest["query"], headers?: HeadersInit): Promise<Result<HttpResponse<T>, AppError>>;
  post<T = unknown>(pathOrUrl: string, body?: unknown, headers?: HeadersInit): Promise<Result<HttpResponse<T>, AppError>>;
  put<T = unknown>(pathOrUrl: string, body?: unknown, headers?: HeadersInit): Promise<Result<HttpResponse<T>, AppError>>;
  patch<T = unknown>(pathOrUrl: string, body?: unknown, headers?: HeadersInit): Promise<Result<HttpResponse<T>, AppError>>;
  delete<T = unknown>(pathOrUrl: string, headers?: HeadersInit): Promise<Result<HttpResponse<T>, AppError>>;
  authenticate(auth: AuthOptions): HttpClient;
}

/** Opcoes para criar o cliente HTTP. */
export interface HttpClientOptions {
  baseUrl?: string;
  headers?: HeadersInit;
  auth?: AuthOptions;
  fetchImpl?: typeof fetch;
}

/**
 * Cria um cliente HTTP com baseUrl/headers/auth opcionais.
 *
 * Exemplo de uso:
 * ```ts
 * const client = createHttpClient({ baseUrl: "https://api.exemplo.com", auth: { type: "bearer", token: "x" } });
 * const r = await client.get("/users");
 * if (r.isSuccess()) {
 *   console.log(r.SuccessValue().data);
 * }
 * ```
 */
export function createHttpClient(options?: HttpClientOptions): HttpClient {
  const baseUrl = options?.baseUrl?.replace(/\/$/, "");
  const baseHeaders = normalizeHeaders(options?.headers);
  const auth = options?.auth;
  const $fetch = options?.fetchImpl ?? fetch;

  async function doRequest<T = unknown>(req: HttpRequest): Promise<Result<HttpResponse<T>, AppError>> {
    try {
      const url = buildUrl({ baseUrl, overrideUrl: req.url, path: req.path, query: req.query });
      const headers = { ...baseHeaders, ...normalizeHeaders(req.headers), ...buildAuthBody(auth) } as HeadersInit;

      const hasBody = req.body !== undefined && req.body !== null;
      const finalInit: RequestInit = {
        method: req.method,
        headers,
        body: hasBody ? serializeBody(req.body, headers) : undefined,
      };

      const res = await $fetch(url, finalInit);
      const parsed = await parseBody(res);
      const response: HttpResponse<T> = {
        status: res.status,
        headers: headersToRecord(res.headers),
        data: parsed.data as T,
        raw: parsed.raw,
      };
      return result.Success<HttpResponse<T>, AppError>(response).unwrap();
    } catch (e) {
      return result.Error<HttpResponse<T>, AppError>(
        createAppError(
          "HTTP_CLIENT_REQUEST_FAILED",
          "Falha ao executar requisicao HTTP",
          { cause: e },
        ),
      ).unwrap();
    }
  }

  const client: HttpClient = {
    request: doRequest,
    get<T = unknown>(pathOrUrl: string, query?: HttpRequest["query"], headers?: HeadersInit) {
      return doRequest<T>({ method: "GET", url: isAbsoluteUrl(pathOrUrl) ? pathOrUrl : undefined, path: isAbsoluteUrl(pathOrUrl) ? undefined : pathOrUrl, query, headers });
    },
    post<T = unknown>(pathOrUrl: string, body?: unknown, headers?: HeadersInit) {
      return doRequest<T>({ method: "POST", url: isAbsoluteUrl(pathOrUrl) ? pathOrUrl : undefined, path: isAbsoluteUrl(pathOrUrl) ? undefined : pathOrUrl, body, headers });
    },
    put<T = unknown>(pathOrUrl: string, body?: unknown, headers?: HeadersInit) {
      return doRequest<T>({ method: "PUT", url: isAbsoluteUrl(pathOrUrl) ? pathOrUrl : undefined, path: isAbsoluteUrl(pathOrUrl) ? undefined : pathOrUrl, body, headers });
    },
    patch<T = unknown>(pathOrUrl: string, body?: unknown, headers?: HeadersInit) {
      return doRequest<T>({ method: "PATCH", url: isAbsoluteUrl(pathOrUrl) ? pathOrUrl : undefined, path: isAbsoluteUrl(pathOrUrl) ? undefined : pathOrUrl, body, headers });
    },
    delete<T = unknown>(pathOrUrl: string, headers?: HeadersInit) {
      return doRequest<T>({ method: "DELETE", url: isAbsoluteUrl(pathOrUrl) ? pathOrUrl : undefined, path: isAbsoluteUrl(pathOrUrl) ? undefined : pathOrUrl, headers });
    },
    authenticate(nextAuth: AuthOptions): HttpClient {
      return createHttpClient({ baseUrl, headers: baseHeaders, auth: nextAuth, fetchImpl: $fetch });
    },
  };

  return client;
}

/** Helper: constroi URL a partir de base, path e query. */
function buildUrl(input: {
  baseUrl?: string;
  overrideUrl?: string;
  path?: string;
  query?: HttpRequest["query"];
}): string {
  if (input.overrideUrl) return appendQuery(input.overrideUrl, input.query);
  const base = input.baseUrl ?? "";
  const path = (input.path ?? "").replace(/^\//, "");
  const joined = path ? `${base}/${path}` : base;
  return appendQuery(joined, input.query);
}

/** Helper: aplica querystring a uma URL. */
function appendQuery(url: string, query?: HttpRequest["query"]): string {
  if (!query) return url;
  const u = new URL(url, isAbsoluteUrl(url) ? undefined : "http://local");
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    u.searchParams.set(k, String(v));
  });
  // Se era absoluta, retorna href; se era relativa, retorna pathname+search
  if (isAbsoluteUrl(url)) return u.href;
  const qs = u.search ? u.search : "";
  const path = u.pathname.startsWith("/") ? u.pathname.substring(1) : u.pathname;
  return qs ? `${path}${qs}` : path;
}

/** Helper: converte Headers em Record. */
function headersToRecord(h: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  h.forEach((val, key) => { out[key] = val; });
  return out;
}

/** Helper: normaliza headers em Record<string,string>. */
function normalizeHeaders(h?: HeadersInit): Record<string, string> {
  if (!h) return {};
  if (Array.isArray(h)) {
    return Object.fromEntries(h);
  }
  if (h instanceof Headers) {
    return headersToRecord(h);
  }
  return { ...h } as Record<string, string>;
}

/** Helper: retorna headers de autenticacao de acordo com AuthOptions. */
function buildAuthBody(auth?: AuthOptions): Record<string, string> {
  if (!auth) return {};
  if (auth.type === "bearer") return { Authorization: `Bearer ${auth.token}` };
  return {};
}

/** Helper: decide content-type e serializa corpo para RequestInit.body. */
function serializeBody(body: unknown, headers: HeadersInit): BodyInit {
  const map = normalizeHeaders(headers);
  const ct = map["content-type"] ?? map["Content-Type"];
  if (ct && ct.toLowerCase().includes("application/json")) {
    return JSON.stringify(body ?? {});
  }
  if (typeof body === "string") return body;
  // fallback: JSON
  return JSON.stringify(body ?? {});
}

/** Helper: parseia corpo da resposta respeitando content-type. */
async function parseBody(res: Response): Promise<{ data: unknown; raw: string | undefined }> {
  const ct = res.headers.get("content-type")?.toLowerCase() ?? "";
  try {
    if (ct.includes("application/json")) {
      const data = await res.json();
      return { data, raw: undefined };
    }
    const text = await res.text();
    return { data: undefined, raw: text };
  } catch (_e) {
    return { data: undefined, raw: undefined };
  }
}

/** Helper: verifica se URL e absoluta. */
function isAbsoluteUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

