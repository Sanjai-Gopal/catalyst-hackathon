import { afterEach, describe, expect, it, vi } from 'vitest'
import { POST as gemini } from '../../api/gemini'
import { POST as sendEmail } from '../../api/send-email'

const ORIGIN = 'https://carenest.example'

function jsonRequest(
  url: string,
  body: unknown,
  origin = ORIGIN,
  authenticated = true
): Request {
  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
      ...(authenticated ? { authorization: 'Bearer test-jwt' } : {}),
    },
    body: JSON.stringify(body),
  })
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('server API security boundaries', () => {
  it('fails closed when allowed browser origins are not configured', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubEnv('APP_ALLOWED_ORIGINS', '')

    const response = await gemini(
      jsonRequest('https://carenest.example/api/gemini', {
        prompt: 'hello',
      })
    )

    expect(response.status).toBe(503)
  })

  it('rejects a request from an origin outside the configured site', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubEnv('APP_ALLOWED_ORIGINS', ORIGIN)

    const response = await gemini(
      jsonRequest(
        'https://carenest.example/api/gemini',
        { prompt: 'hello' },
        'https://attacker.example'
      )
    )

    expect(response.status).toBe(403)
  })

  it('rejects oversized request bodies before parsing them', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubEnv('APP_ALLOWED_ORIGINS', ORIGIN)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }))

    const response = await gemini(
      jsonRequest('https://carenest.example/api/gemini', {
        prompt: 'x'.repeat(13_000),
      })
    )

    expect(response.status).toBe(413)
  })

  it('requires a recipient allow-list before the email relay can send', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    vi.stubEnv('APP_ALLOWED_ORIGINS', ORIGIN)
    vi.stubEnv('ALLOWED_EMAIL_RECIPIENTS', '')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    const response = await sendEmail(
      jsonRequest('https://carenest.example/api/send-email', {
        to: 'family@example.com',
        subject: 'Reminder',
        html: '<p>Reminder</p>',
      })
    )

    expect(response.status).toBe(503)
    expect(fetchMock).toHaveBeenCalledTimes(1) // Appwrite session verification only.
  })

  it('does not send email to recipients outside the allow-list', async () => {
    vi.stubEnv('RESEND_API_KEY', 'test-key')
    vi.stubEnv('APP_ALLOWED_ORIGINS', ORIGIN)
    vi.stubEnv('ALLOWED_EMAIL_RECIPIENTS', 'family@example.com')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 })
    vi.stubGlobal('fetch', fetchMock)

    const response = await sendEmail(
      jsonRequest('https://carenest.example/api/send-email', {
        to: 'attacker@example.com',
        subject: 'Reminder',
        html: '<p>Reminder</p>',
      })
    )

    expect(response.status).toBe(403)
    expect(fetchMock).toHaveBeenCalledTimes(1) // Appwrite session verification only.
  })

  it('requires a valid Appwrite session before using paid APIs', async () => {
    vi.stubEnv('GEMINI_API_KEY', 'test-key')
    vi.stubEnv('APP_ALLOWED_ORIGINS', ORIGIN)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await gemini(
      jsonRequest(
        'https://carenest.example/api/gemini',
        { prompt: 'hello' },
        ORIGIN,
        false
      )
    )

    expect(response.status).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
