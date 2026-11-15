import type { ZodType } from 'zod';

export const MAX_BODY_BYTES = 32 * 1024;

export class HttpError extends Error {
  readonly status: number;
  readonly headers: Record<string, string>;
  constructor(status: number, message: string, headers: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.headers = headers;
  }
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}

/** Reads and validates a JSON body, rejecting oversized or malformed input. */
export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, 'Request body too large.');
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) throw new HttpError(413, 'Request body too large.');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(400, 'Invalid request: ' + result.error.issues.map((i) => i.path.join('.') + ' ' + i.message).join('; '));
  }
  return result.data;
}

/** Wraps a handler so HttpError becomes a clean JSON error and nothing else leaks. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status, err.headers);
    console.error('[api] unhandled error:', err instanceof Error ? err.message : err);
    return json({ error: 'Internal server error.' }, 500);
  }
}
