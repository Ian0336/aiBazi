/**
 * Lightweight backend client.
 *
 *   - Reads the base URL from NEXT_PUBLIC_API_BASE_URL_{DEV,PROD}.
 *   - Injects `Authorization: Bearer <accessToken>` from the Jotai store.
 *   - Always sends credentials so the refresh cookie can ride along.
 *   - On 401, tries `POST /auth/refresh` once. If a new access token comes
 *     back, retries the original request transparently. On a second 401,
 *     clears the auth state and rethrows.
 *
 * SSE (text/event-stream) responses are returned untouched — caller is
 * expected to consume `response.body.getReader()` themselves.
 */

import { jotaiStore } from '@/store/jotai';
import { accessTokenAtom, currentUserAtom } from '@/store/auth';
import { apiBase } from '@/lib/baseUrl';
import type { AccessTokenResponse } from '@/types/auth';

export { apiBase };

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
  }
}

function authHeader(): Record<string, string> {
  const token = jotaiStore.get(accessTokenAtom);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function refreshAccessToken(): Promise<string | null> {
  const r = await fetch(`${apiBase()}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!r.ok) return null;
  const data = (await r.json()) as AccessTokenResponse;
  jotaiStore.set(accessTokenAtom, data.access_token);
  return data.access_token;
}

function clearAuth() {
  jotaiStore.set(accessTokenAtom, null);
  jotaiStore.set(currentUserAtom, null);
}

export interface ApiFetchOptions extends RequestInit {
  /** When true, do not attempt token refresh on 401 (used by /auth/* itself). */
  skipAuthRetry?: boolean;
  /** When true, return the raw Response so the caller can stream the body. */
  raw?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuthRetry, raw, headers, ...init } = options;
  const url = path.startsWith('http') ? path : `${apiBase()}${path}`;

  const doFetch = () =>
    fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body && !(init.body instanceof FormData)
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...authHeader(),
        ...(headers as Record<string, string> | undefined),
      },
    });

  let response = await doFetch();

  if (response.status === 401 && !skipAuthRetry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch();
    } else {
      clearAuth();
    }
  }

  if (raw) {
    return response as unknown as T;
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  let body: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    body = await response.json().catch(() => null);
  } else {
    body = await response.text().catch(() => null);
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }
  return body as T;
}

/** Returns the raw Response for SSE streaming. */
export async function apiStream(path: string, init: RequestInit = {}): Promise<Response> {
  const url = path.startsWith('http') ? path : `${apiBase()}${path}`;

  const doFetch = () =>
    fetch(url, {
      ...init,
      credentials: 'include',
      headers: {
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader(),
        ...(init.headers as Record<string, string> | undefined),
      },
    });

  let response = await doFetch();
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch();
    } else {
      clearAuth();
    }
  }
  return response;
}
