import { HttpError } from './http.js';

/**
 * Fixed-window rate limiter held in memory. On serverless this is per warm
 * instance, so it is a best-effort brake against bursts and runaway clients, not
 * a global quota. See "Known limitations" in the README.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): void {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    throw new HttpError(429, 'Too many requests. Please wait and try again.', {
      'Retry-After': String(retryAfter),
    });
  }
}

export function resetRateLimits(): void {
  buckets.clear();
}
