const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}
const serverEnvironment = (
  globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> }
  }
).process?.env ?? {}

export function getServerEnv(name: string): string | undefined {
  return serverEnvironment[name]
}

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  })
}

/** Restrict browser calls to explicitly configured first-party origins. */
export function validateApiOrigin(request: Request): Response | null {
  const configuredOrigins = (serverEnvironment.APP_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (configuredOrigins.length === 0) {
    return jsonError('API origins are not configured', 503)
  }

  const requestOrigin = request.headers.get('origin')
  if (!requestOrigin || !configuredOrigins.includes(requestOrigin)) {
    return jsonError('Origin not allowed', 403)
  }

  return null
}

/** Read JSON with an enforced byte limit before parsing it. */
export async function readLimitedJson(
  request: Request,
  maxBytes: number
): Promise<{ value: unknown } | { error: Response }> {
  if (request.method !== 'POST') {
    return { error: jsonError('Method not allowed', 405) }
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return { error: jsonError('Content-Type must be application/json', 415) }
  }

  if (!request.body) {
    return { error: jsonError('Request body is required', 400) }
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel()
        return { error: jsonError('Request body is too large', 413) }
      }
      chunks.push(value)
    }

    const body = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      body.set(chunk, offset)
      offset += chunk.byteLength
    }

    return { value: JSON.parse(new TextDecoder().decode(body)) as unknown }
  } catch {
    return { error: jsonError('Invalid JSON body', 400) }
  }
}

/** Verify Appwrite session JWTs before allowing paid third-party API calls. */
export async function requireAppwriteUser(
  request: Request
): Promise<Response | null> {
  const authorization = request.headers.get('authorization') ?? ''
  const jwt = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : ''
  if (!jwt) return jsonError('Sign in is required', 401)

  const endpoint = (
    serverEnvironment.APPWRITE_ENDPOINT ??
    serverEnvironment.VITE_APPWRITE_ENDPOINT ??
    'https://sgp.cloud.appwrite.io/v1'
  ).replace(/\/$/, '')
  const projectId =
    serverEnvironment.APPWRITE_PROJECT_ID ??
    serverEnvironment.VITE_APPWRITE_PROJECT_ID ??
    '6af86666003a589a4773'

  try {
    const response = await fetch(`${endpoint}/account`, {
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-JWT': jwt,
      },
      signal: AbortSignal.timeout(5_000),
    })
    if (response.ok) return null
    if (response.status === 401 || response.status === 403) {
      return jsonError('Sign in is required', 401)
    }
  } catch {
    return jsonError('Authentication service is unavailable', 502)
  }

  return jsonError('Authentication service is unavailable', 502)
}
