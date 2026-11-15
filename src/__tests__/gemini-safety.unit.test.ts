import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('../lib/auth', () => ({
  getApiAuthHeaders: async () => ({ Authorization: 'Bearer test-jwt' }),
}))
import { INITIAL_MEDICATIONS } from '../data/carenestInitialData'
import {
  analyzeDrugInteractionsWithGemini,
  buildUnverifiedAlert,
  isDrugInteractionAlert,
  parsePrescriptionWithGemini,
} from '../services/geminiHealthcare'

function mockProxy(response: { ok: boolean; status?: number; body?: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 503),
      json: async () => response.body,
    })
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('Gemini clinical safety contract', () => {
  it('never reports medications as safe when the AI check could not run', () => {
    const alert = buildUnverifiedAlert(INITIAL_MEDICATIONS)
    expect(alert.severity).toBe('warning')
    expect(alert.description).toMatch(/NOT been verified/)
    expect(alert.medicationsInvolved).toHaveLength(INITIAL_MEDICATIONS.length)
  })

  it('when the proxy is not configured (503), interaction analysis degrades to an unverified warning', async () => {
    mockProxy({ ok: false, status: 503 })
    const alerts = await analyzeDrugInteractionsWithGemini(INITIAL_MEDICATIONS)
    expect(alerts.every((a) => a.severity !== 'safe')).toBe(true)
  })

  it('single medication cannot interact, so it is reported safe truthfully', async () => {
    const alerts = await analyzeDrugInteractionsWithGemini([
      INITIAL_MEDICATIONS[0],
    ])
    expect(alerts[0].severity).toBe('safe')
  })

  it('when the network is down, analysis still never claims safety', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const alerts = await analyzeDrugInteractionsWithGemini(INITIAL_MEDICATIONS)
    expect(alerts[0].severity).toBe('warning')
  })

  it('refuses to fabricate prescription data when Gemini is unavailable', async () => {
    mockProxy({ ok: false, status: 503 })
    await expect(
      parsePrescriptionWithGemini('Rx: Telmisartan 40mg')
    ).rejects.toThrow(/503/)
  })

  it('returns validated alerts from a successful Gemini response', async () => {
    const alert = {
      severity: 'danger',
      medicationsInvolved: ['A', 'B'],
      description: 'Risk of hypotension',
      recommendation: 'Call the doctor',
    }
    mockProxy({ ok: true, body: { text: JSON.stringify([alert]) } })
    const alerts = await analyzeDrugInteractionsWithGemini(INITIAL_MEDICATIONS)
    expect(alerts).toEqual([alert])
  })

  it('discards malformed AI output instead of trusting it', async () => {
    mockProxy({
      ok: true,
      body: { text: JSON.stringify([{ severity: 'safe' }]) },
    })
    const alerts = await analyzeDrugInteractionsWithGemini(INITIAL_MEDICATIONS)
    expect(alerts[0].severity).toBe('warning')
  })

  it('parses a prescription from a successful Gemini response', async () => {
    mockProxy({
      ok: true,
      body: {
        text: JSON.stringify([
          { name: 'Telmisartan', dosage: '40mg', slot: 'morning' },
        ]),
      },
    })
    const meds = await parsePrescriptionWithGemini('Rx: Telmisartan 40mg')
    expect(meds[0].name).toBe('Telmisartan')
  })

  it('validates the shape of AI responses', () => {
    expect(
      isDrugInteractionAlert({
        severity: 'danger',
        medicationsInvolved: ['A', 'B'],
        description: 'x',
        recommendation: 'y',
      })
    ).toBe(true)
    expect(isDrugInteractionAlert({ severity: 'maybe' })).toBe(false)
    expect(isDrugInteractionAlert(null)).toBe(false)
    expect(isDrugInteractionAlert('text')).toBe(false)
  })
})
