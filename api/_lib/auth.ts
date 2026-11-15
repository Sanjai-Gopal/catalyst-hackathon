import { appwriteEndpoint, appwriteProjectId } from './env.js';
import { HttpError } from './http.js';

export interface AuthedUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Verifies the caller's Appwrite session. The browser sends a short-lived JWT
 * (account.createJWT()) as `Authorization: Bearer <jwt>`; Appwrite validates it.
 */
export async function requireUser(request: Request): Promise<AuthedUser> {
  const header = request.headers.get('authorization') ?? '';
  const jwt = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!jwt) throw new HttpError(401, 'Sign in required.');

  let res: Response;
  try {
    res = await fetch(`${appwriteEndpoint()}/account`, {
      headers: { 'X-Appwrite-Project': appwriteProjectId(), 'X-Appwrite-JWT': jwt },
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw new HttpError(503, 'Could not verify your session. Try again.');
  }
  if (!res.ok) throw new HttpError(401, 'Your session is invalid or expired. Sign in again.');
  const user = (await res.json()) as { $id?: string; email?: string; name?: string };
  if (!user.$id) throw new HttpError(401, 'Your session is invalid or expired. Sign in again.');
  return { id: user.$id, email: user.email ?? '', name: user.name ?? '' };
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
