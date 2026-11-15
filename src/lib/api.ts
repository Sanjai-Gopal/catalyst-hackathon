import { account } from './appwrite';

export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * POSTs JSON to a same-origin /api endpoint with the caller's Appwrite session
 * token. Throws ApiError (with the server's message) on any failure, including
 * timeouts, so callers can never mistake a failure for success.
 */
export async function apiPost<T>(
  path: string,
  body: unknown,
  opts: { timeoutMs?: number } = {}
): Promise<T> {
  let jwt: string;
  try {
    jwt = (await account.createJWT()).jwt;
  } catch {
    throw new ApiError(401, 'You are not signed in.');
  }

  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 25_000),
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'TimeoutError';
    throw new ApiError(0, timedOut ? 'The request timed out.' : 'Could not reach the server.');
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON error body; handled below
  }
  if (!res.ok) {
    const message =
      typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
        ? data.error
        : `Request failed (HTTP ${res.status}).`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}
