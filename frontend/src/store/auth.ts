/**
 * Auth state — access token kept in memory only; the refresh token lives in
 * an httpOnly cookie owned by the backend. On a fresh page load,
 * `bootstrapAuth()` silently exchanges the refresh cookie for a new access
 * token (if any) so users stay signed in across reloads.
 */

import { atom } from 'jotai';
import { jotaiStore } from './jotai';
import type { CurrentUser, AccessTokenResponse } from '@/types/auth';
import { apiBase } from '@/lib/baseUrl';

export const accessTokenAtom = atom<string | null>(null);
export const currentUserAtom = atom<CurrentUser | null>(null);
export const authLoadingAtom = atom<boolean>(true);

/** True while the bootstrap call is in flight; useful to gate UI. */
let bootstrapPromise: Promise<void> | null = null;

export async function bootstrapAuth(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    jotaiStore.set(authLoadingAtom, true);
    try {
      // Try refresh — if no cookie / expired, the call returns 401 and we
      // silently stay anonymous.
      const refreshResp = await fetch(`${apiBase()}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!refreshResp.ok) return;
      const tok = (await refreshResp.json()) as AccessTokenResponse;
      jotaiStore.set(accessTokenAtom, tok.access_token);

      const meResp = await fetch(`${apiBase()}/auth/me`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${tok.access_token}` },
      });
      if (meResp.ok) {
        jotaiStore.set(currentUserAtom, (await meResp.json()) as CurrentUser);
      }
    } finally {
      jotaiStore.set(authLoadingAtom, false);
    }
  })();
  return bootstrapPromise;
}

/** Begin Google OAuth — fetch auth URL then redirect. */
export async function startGoogleLogin(): Promise<void> {
  const r = await fetch(`${apiBase()}/auth/google/login`, { credentials: 'include' });
  if (!r.ok) throw new Error('failed to start login');
  const { auth_url } = (await r.json()) as { auth_url: string };
  window.location.href = auth_url;
}

/** Wipe local auth state and tell backend to clear the refresh cookie. */
export async function logout(): Promise<void> {
  try {
    await fetch(`${apiBase()}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } finally {
    jotaiStore.set(accessTokenAtom, null);
    jotaiStore.set(currentUserAtom, null);
  }
}
