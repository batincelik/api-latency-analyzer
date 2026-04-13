import type { ApiErrorBody } from '@ala/types';
import { clearTokens, getTokens, setTokens } from './auth';

const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.body = body;
  }
}

async function refreshAccess(): Promise<string | null> {
  const { refresh } = getTokens();
  if (!refresh) return null;
  const res = await fetch(`${base}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { retry?: boolean } = {},
): Promise<T> {
  const { retry = true, ...rest } = init;
  const headers = new Headers(rest.headers);
  const { access } = getTokens();
  if (access) headers.set('authorization', `Bearer ${access}`);
  if (!headers.has('content-type') && rest.body) {
    headers.set('content-type', 'application/json');
  }

  const res = await fetch(`${base}${path}`, { ...rest, headers });
  if (res.status === 401 && retry) {
    const next = await refreshAccess();
    if (next) {
      return apiFetch<T>(path, { ...init, retry: false });
    }
    clearTokens();
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiErrorBody;
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
