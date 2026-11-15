import {
  readLimitedJson,
  getServerEnv,
  requireAppwriteUser,
  validateApiOrigin,
} from '../src/lib/server-security'

/**
 * Server-side Gemini proxy (Vercel Function).
 * Keeps GEMINI_API_KEY out of the browser bundle.
 * Env: GEMINI_API_KEY (server-only, do NOT prefix with VITE_).
 */
const MODEL = 'gemini-2.5-flash'
const MAX_PROMPT_CHARS = 8000
const MAX_BODY_BYTES = 12_000

interface GeminiRequestBody {
  prompt?: unknown
  temperature?: unknown
  json?: unknown
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = getServerEnv('GEMINI_API_KEY')
  if (!apiKey) return json({ error: 'Gemini is not configured' }, 503)

  const originError = validateApiOrigin(request)
  if (originError) return originError

  const authError = await requireAppwriteUser(request)
  if (authError) return authError

  const parsedBody = await readLimitedJson(request, MAX_BODY_BYTES)
  if ('error' in parsedBody) return parsedBody.error
  const body = parsedBody.value as GeminiRequestBody

  const { prompt, temperature, json: wantsJson } = body
  if (typeof prompt !== 'string' || prompt.length === 0 || prompt.length > MAX_PROMPT_CHARS) {
    return json({ error: `prompt must be a string of 1-${MAX_PROMPT_CHARS} characters` }, 400)
  }
  const temp =
    typeof temperature === 'number' && temperature >= 0 && temperature <= 1 ? temperature : 0.2

  let upstream: Response
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: temp,
            ...(wantsJson === true ? { responseMimeType: 'application/json' } : {}),
          },
        }),
        signal: AbortSignal.timeout(20_000),
      }
    )
  } catch {
    return json({ error: 'Gemini service is unavailable' }, 502)
  }

  if (!upstream.ok) return json({ error: 'Gemini request failed' }, 502)

  const data = (await upstream.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  return json({ text })
}
