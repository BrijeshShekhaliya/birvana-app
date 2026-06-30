import { env } from '@/config/env';
import { supabase } from '@/services/supabase/client';

type ApiMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT';

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  body?: BodyInit | object | null;
  method?: ApiMethod;
};

const isJsonLike = (value: unknown) =>
  typeof value === 'object' && value !== null && !(value instanceof FormData);

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function extractErrorMessage(details: unknown, status: number) {
  if (typeof details === 'string' && details.trim()) {
    const trimmed = details.trim();
    // Do not display raw HTML error pages to the user
    if (trimmed.toLowerCase().startsWith('<!doctype html>') || trimmed.toLowerCase().startsWith('<html')) {
      return `Request failed with status ${status} (Server Error)`;
    }
    // Truncate excessively long non-HTML dumps
    if (trimmed.length > 200) {
      return trimmed.substring(0, 200) + '...';
    }
    return trimmed;
  }

  if (details && typeof details === 'object') {
    const message =
      'error' in details && typeof details.error === 'string'
        ? details.error
        : 'message' in details && typeof details.message === 'string'
          ? details.message
          : null;

    if (message?.trim()) {
      return message.trim();
    }
  }

  return status === 0
    ? 'Network error. Check your connection and try again.'
    : `Request failed with status ${status}`;
}

async function buildHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);
  const {
    data: { session },
  } = await supabase.auth.getSession();

  nextHeaders.set('Accept', 'application/json');

  if (!nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  if (session?.access_token) {
    nextHeaders.set('Authorization', `Bearer ${session.access_token}`);
  }

  return nextHeaders;
}

async function parseResponse<T>(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const { body, headers, method = 'GET', ...rest } = options;
  const nextHeaders = await buildHeaders(headers);
  let payload: BodyInit | null | undefined;

  if (isJsonLike(body)) {
    payload = JSON.stringify(body);
  } else {
    payload = body as BodyInit | null | undefined;
  }

  if (body instanceof FormData) {
    nextHeaders.delete('Content-Type');
  }

  const response = await fetch(`${env.apiUrl}${path}`, {
    ...rest,
    body: payload,
    headers: nextHeaders,
    method,
  });

  const data = await parseResponse<unknown>(response);

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data, response.status),
      response.status,
      data,
    );
  }

  return data as T;
}

export const apiClient = {
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  patch: <T>(
    path: string,
    body?: RequestOptions['body'],
    options?: RequestOptions,
  ) => request<T>(path, { ...options, body, method: 'PATCH' }),
  post: <T>(
    path: string,
    body?: RequestOptions['body'],
    options?: RequestOptions,
  ) => request<T>(path, { ...options, body, method: 'POST' }),
  put: <T>(
    path: string,
    body?: RequestOptions['body'],
    options?: RequestOptions,
  ) => request<T>(path, { ...options, body, method: 'PUT' }),
};
