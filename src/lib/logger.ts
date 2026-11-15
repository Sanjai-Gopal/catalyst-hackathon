/**
 * Central logger. The only place in the app allowed to touch `console`,
 * so lint can forbid stray console calls everywhere else.
 */
export const logger = {
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
}
