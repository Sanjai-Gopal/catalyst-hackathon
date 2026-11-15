import { getApiAuthHeaders } from '@/lib/auth'
import { logger } from '@/lib/logger'
import type { Medication, DrugInteractionAlert } from '../types/carenest'

/**
 * Calls Google Gemini 2.5 Flash through the server-side proxy (/api/gemini),
 * so the API key never ships in the browser bundle.
 * Throws if the proxy is unreachable or not configured.
 */
export async function callGemini(
  prompt: string,
  options: { temperature?: number; json?: boolean } = {}
): Promise<string> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getApiAuthHeaders()),
    },
    body: JSON.stringify({
      prompt,
      temperature: options.temperature,
      json: options.json,
    }),
  })
  if (!res.ok) {
    throw new Error(`Gemini proxy responded with HTTP ${res.status}`)
  }
  const data = (await res.json()) as { text?: string }
  return (data.text ?? '').trim()
}

export function isDrugInteractionAlert(v: unknown): v is DrugInteractionAlert {
  if (typeof v !== 'object' || v === null) return false
  const o = v as Record<string, unknown>
  return (
    (o.severity === 'safe' ||
      o.severity === 'warning' ||
      o.severity === 'danger') &&
    Array.isArray(o.medicationsInvolved) &&
    typeof o.description === 'string' &&
    typeof o.recommendation === 'string'
  )
}

/**
 * Safety-critical fallback: when the AI check cannot run we must NEVER claim
 * the medications are safe. We surface an explicit "not verified" warning.
 */
export function buildUnverifiedAlert(
  medications: Medication[]
): DrugInteractionAlert {
  return {
    severity: 'warning',
    medicationsInvolved: medications.map((m) => m.name),
    description:
      'The AI interaction check could not be completed, so these medications have NOT been verified.',
    recommendation:
      'Please confirm this combination with your doctor or pharmacist before changing any dose.',
  }
}

/**
 * 1. AI Clinical Drug-Drug Interaction Analyzer
 * Uses Google Gemini 2.5 Flash to inspect medication contraindications in geriatric care.
 */
export async function analyzeDrugInteractionsWithGemini(
  medications: Medication[]
): Promise<DrugInteractionAlert[]> {
  if (medications.length < 2) {
    return [
      {
        severity: 'safe',
        medicationsInvolved: medications.map((m) => m.name),
        description:
          'Fewer than two active medications, so no drug-drug interaction is possible.',
        recommendation: 'Take as prescribed by your doctor.',
      },
    ]
  }

  const prompt = `You are an expert clinical pharmacist specializing in geriatric healthcare.
Analyze the following list of active medications prescribed to an elderly patient:
${medications.map((m) => `- ${m.name} (${m.dosage}, timing: ${m.slot}, instructions: ${m.instructions})`).join('\n')}

Identify any clinically significant drug-drug interactions, adverse combination risks, or important dietary cautions.
Respond with a strict JSON array of objects with these exact keys:
[
  {
    "severity": "safe" | "warning" | "danger",
    "medicationsInvolved": ["Medication A", "Medication B"],
    "description": "Clear explanation of the clinical interaction in gentle, empathetic terms",
    "recommendation": "Actionable advice for the caretaker/elder",
    "dietaryNote": "Any food/drink that must be avoided"
  }
]`

  try {
    const text =
      (await callGemini(prompt, { json: true, temperature: 0.2 })) || '[]'
    const parsed: unknown = JSON.parse(text)
    const list = Array.isArray(parsed) ? parsed : [parsed]
    const valid = list.filter(isDrugInteractionAlert)
    return valid.length > 0 ? valid : [buildUnverifiedAlert(medications)]
  } catch (error) {
    logger.error('[GeminiHealthcare] Interaction check failed:', error)
    return [buildUnverifiedAlert(medications)]
  }
}

/**
 * 2. AI Prescription & Pill Bottle OCR Parser
 */
export async function parsePrescriptionWithGemini(
  prescriptionText: string
): Promise<Partial<Medication>[]> {
  const prompt = `You are a medical OCR specialist. Extract structured medication schedules from this doctor prescription notes or pill bottle text:
"""
${prescriptionText}
"""

Return a strict JSON array of medications:
[
  {
    "name": "Brand and generic medication name",
    "dosage": "Dosage (e.g. 500mg, 1 tablet)",
    "slot": "morning" | "afternoon" | "evening" | "night",
    "time": "e.g. 08:00 AM",
    "instructions": "Specific intake guidance (e.g. with meals, before bed)",
    "purpose": "Primary condition treated (e.g. Blood Pressure, Diabetes)",
    "criticality": "high" | "medium" | "low"
  }
]`

  try {
    // Never invent medication data for a patient: if Gemini is unavailable this throws
    // and the UI asks the user to enter the medication manually.
    const text =
      (await callGemini(prompt, { json: true, temperature: 0.1 })) || '[]'
    const parsed: unknown = JSON.parse(text)
    return Array.isArray(parsed) ? (parsed as Partial<Medication>[]) : []
  } catch (err) {
    logger.error('[GeminiHealthcare] Prescription parse error:', err)
    throw err
  }
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ta: 'Tamil (தமிழ்)',
  hi: 'Hindi (हिन्दी)',
  te: 'Telugu (తెలుగు)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  es: 'Spanish (Español)',
}

/**
 * 3. AI Elder Companion / Voice Explainer with Multi-Language Support
 */
export async function generateElderFriendlyExplanation(
  medicationName: string,
  instructions: string,
  honorific: string = 'Amma',
  language: string = 'en'
): Promise<string> {
  const targetLanguageName = LANGUAGE_NAMES[language] || 'English'

  const fallbackMessage = (): string => {
    if (language === 'ta') {
      return `${honorific}, மருத்துவர் கூறியபடி ${medicationName} மருந்தை வெதுவெதுப்பான நீருடன் எடுத்துக் கொள்ளுங்கள்.`
    }
    if (language === 'hi') {
      return `${honorific}, डॉक्टर के बताए अनुसार ${medicationName} दवा पानी के साथ ले लीजिए।`
    }
    if (language === 'te') {
      return `${honorific}, డాక్టర్ చెప్పినట్లుగా ${medicationName} మందును నీటితో తీసుకోండి.`
    }
    if (language === 'kn') {
      return `${honorific}, ವೈದ್ಯರು ತಿಳಿಸಿದಂತೆ ${medicationName} ಔಷಧಿಯನ್ನು ನೀರಿನೊಂದಿಗೆ ಸೇವಿಸಿ.`
    }
    if (language === 'ml') {
      return `${honorific}, ഡോക്ടർ പറഞ്ഞതുപോലെ ${medicationName} മരുന്ന് വെള്ളത്തോടൊപ്പം കഴിക്കൂ.`
    }
    if (language === 'es') {
      return `${honorific}, por favor tome su medicamento ${medicationName} con agua según las indicaciones de su médico.`
    }
    return `${honorific}, please take your ${medicationName} with a glass of water as advised by your doctor.`
  }

  const prompt = `Convert the following medical instruction into an empathetic, warm, easy-to-understand 2-sentence audio reminder for an elderly elder affectionately addressed as "${honorific}".
Target Language: Write the entire response strictly in ${targetLanguageName}. Keep it culturally affectionate, respectful, reassuring, and crystal clear so that an elder listening to voice audio understands immediately:
Medication: ${medicationName}
Medical Instructions: ${instructions}`

  try {
    return (await callGemini(prompt, { temperature: 0.4 })) || fallbackMessage()
  } catch {
    return fallbackMessage()
  }
}
