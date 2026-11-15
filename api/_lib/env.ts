/**
 * Reads a server-side environment variable. Written against globalThis so the
 * handlers stay testable without a Node-only import.
 */
export function env(name: string): string {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[name] ?? '';
}

/** Appwrite project coordinates are public identifiers (not secrets). */
export function appwriteEndpoint(): string {
  return env('APPWRITE_ENDPOINT') || env('VITE_APPWRITE_ENDPOINT') || 'https://sgp.cloud.appwrite.io/v1';
}

export function appwriteProjectId(): string {
  return env('APPWRITE_PROJECT_ID') || env('VITE_APPWRITE_PROJECT_ID');
}
