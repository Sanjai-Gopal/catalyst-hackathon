import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildEmailTemplate,
  escapeHtml,
  sendEmailNotification,
} from '../services/emailService'

vi.mock('../lib/auth', () => ({
  getApiAuthHeaders: async () => ({ Authorization: 'Bearer test-jwt' }),
}))

const base = {
  recipientEmail: 'child@example.com',
  recipientName: 'Child',
  elderName: 'Amma',
  type: 'missed_medication' as const,
  medicationOrDetails: 'Amlodipine 5mg',
  scheduledTime: '08:00 AM',
}

afterEach(() => vi.unstubAllGlobals())

describe('Email template safety', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml(`<b onclick="x">&'`)).toBe(
      '&lt;b onclick=&quot;x&quot;&gt;&amp;&#39;'
    )
  })

  it('does not let user text inject markup into the HTML body', () => {
    const { html } = buildEmailTemplate({
      ...base,
      elderName: '<script>alert(1)</script>',
      medicationOrDetails: '<img src=x onerror=alert(1)>',
    })
    expect(html).not.toContain('<script>alert(1)</script>')
    expect(html).not.toContain('<img src=x')
    expect(html).toContain('&lt;script&gt;')
  })

  it('keeps subjects as plain single-line text', () => {
    const { subject } = buildEmailTemplate({
      ...base,
      elderName: 'Amma\r\nBcc: x@evil.com & <Co>',
    })
    expect(subject).not.toMatch(/[\r\n]/)
    expect(subject).toContain('& <Co>')
  })
})

describe('Email dispatch honesty', () => {
  it('reports success only when the relay accepts the email', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'abc' }),
      })
    )
    const result = await sendEmailNotification(base)
    expect(result.success).toBe(true)
    expect(result.messageId).toBe('abc')
  })

  it('reports failure (never fake success) when the relay rejects', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 503, text: async () => 'down' })
    )
    const result = await sendEmailNotification(base)
    expect(result.success).toBe(false)
    expect(result.error).toContain('503')
  })

  it('reports failure on network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const result = await sendEmailNotification(base)
    expect(result.success).toBe(false)
    expect(result.error).toBe('offline')
  })
})
