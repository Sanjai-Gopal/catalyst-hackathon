import {
  readLimitedJson,
  getServerEnv,
  requireAppwriteUser,
  validateApiOrigin,
} from '../src/lib/server-security'

/**
 * Server-side email relay via Resend (Vercel Function).
 * Env: RESEND_API_KEY and ALLOWED_EMAIL_RECIPIENTS (both server-only).
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_BODY_BYTES = 55_000

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = getServerEnv('RESEND_API_KEY')
  if (!apiKey) return json({ error: 'Email is not configured' }, 503)

  const originError = validateApiOrigin(request)
  if (originError) return originError

  const authError = await requireAppwriteUser(request)
  if (authError) return authError

  const parsedBody = await readLimitedJson(request, MAX_BODY_BYTES)
  if ('error' in parsedBody) return parsedBody.error
  const body = parsedBody.value as { to?: unknown; subject?: unknown; html?: unknown }

  const { to, subject, html } = body
  if (typeof to !== 'string' || !EMAIL_RE.test(to) || to.length > 254) {
    return json({ error: 'Invalid recipient' }, 400)
  }
  if (typeof subject !== 'string' || subject.length === 0 || subject.length > 200 || /[\r\n]/.test(subject)) {
    return json({ error: 'Invalid subject' }, 400)
  }
  if (typeof html !== 'string' || html.length === 0 || html.length > 50_000) {
    return json({ error: 'Invalid html' }, 400)
  }

  const configuredRecipients = getServerEnv('ALLOWED_EMAIL_RECIPIENTS') ?? ''
  const allowList = configuredRecipients
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
  if (allowList.length === 0) {
    return json({ error: 'Email recipients are not configured' }, 503)
  }
  if (!allowList.includes(to.toLowerCase())) {
    return json({ error: 'Recipient not allowed' }, 403)
  }

  let upstream: Response
  try {
    upstream = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from: 'CareNest AI <onboarding@resend.dev>', to: [to], subject, html }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    return json({ error: 'Email service is unavailable' }, 502)
  }

  if (!upstream.ok) return json({ error: 'Email provider rejected the request' }, 502)
  const data = (await upstream.json()) as { id?: string }
  return json({ id: data.id ?? null })
}
