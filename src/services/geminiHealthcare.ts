import { type DrugInteractionAlert, type Medication } from '../types/carenest';
import { ApiError, apiPost } from '../lib/api';
import {
  normalizeAlerts,
  normalizePrescriptionItems,
  unknownAlert,
} from '../shared/gemini';

/**
 * Browser-side client for the server AI endpoints under /api/ai. The Gemini key
 * lives only on the server. These functions keep the safety contract:
 *  - a failed interaction check is reported as 'unknown', never as "all clear";
 *  - prescription OCR THROWS on failure and never invents medicines.
 */

export async function analyzeDrugInteractionsWithGemini(
  medications: Medication[]
): Promise<DrugInteractionAlert[]> {
  const names = medications.map((m) => m.name);
  if (medications.length < 2) {
    return [
      {
        severity: 'safe',
        medicationsInvolved: names,
        description:
          'Fewer than two medicines are scheduled, so there are no drug-to-drug interactions to check.',
        recommendation: 'Take as prescribed. Tell your doctor about any new medicine or supplement.',
      },
    ];
  }

  try {
    const data = await apiPost<{ alerts: unknown }>('/api/ai/interactions', {
      medications: medications.map((m) => ({
        name: m.name,
        dosage: m.dosage,
        slot: m.slot,
        instructions: m.instructions,
      })),
    });
    return normalizeAlerts(data.alerts, names);
  } catch (err) {
    // A failed check must never read as "all clear".
    const reason =
      err instanceof ApiError
        ? `The AI interaction check could not be completed (${err.message}).`
        : 'The AI interaction check could not be completed.';
    return [unknownAlert(names, reason)];
  }
}

/**
 * Extracts medications from prescription text.
 *
 * THROWS when parsing is unavailable or fails. It never invents medicines.
 * Callers must catch the error and fall back to manual entry. Output is always a
 * draft for a human to review before saving.
 */
export async function parsePrescriptionWithGemini(
  prescriptionText: string
): Promise<Partial<Medication>[]> {
  const data = await apiPost<{ medications: unknown }>('/api/ai/prescription', {
    text: prescriptionText,
  });
  return normalizePrescriptionItems(data.medications);
}

const FALLBACK_EXPLANATIONS: Record<string, (honorific: string, med: string) => string> = {
  ta: (h, m) => `${h}, மருத்துவர் கூறியபடி ${m} மருந்தை வெதுவெதுப்பான நீருடன் எடுத்துக் கொள்ளுங்கள்.`,
  hi: (h, m) => `${h}, डॉक्टर के बताए अनुसार ${m} दवा पानी के साथ ले लीजिए।`,
  te: (h, m) => `${h}, డాక్టర్ చెప్పినట్లుగా ${m} మందును నీటితో తీసుకోండి.`,
  kn: (h, m) => `${h}, ವೈದ್ಯರು ತಿಳಿಸಿದಂತೆ ${m} ಔಷಧಿಯನ್ನು ನೀರಿನೊಂದಿಗೆ ಸೇವಿಸಿ.`,
  ml: (h, m) => `${h}, ഡോക്ടർ പറഞ്ഞതുപോലെ ${m} മരുന്ന് വെള്ളത്തോടൊപ്പം കഴിക്കൂ.`,
  es: (h, m) =>
    `${h}, por favor tome su medicamento ${m} con agua según las indicaciones de su médico.`,
};

/** Plain, non-AI reminder used when the AI explanation is unavailable. */
export function fallbackExplanation(medicationName: string, honorific: string, language: string): string {
  const localized = FALLBACK_EXPLANATIONS[language];
  return localized
    ? localized(honorific, medicationName)
    : `${honorific}, please take your ${medicationName} with a glass of water as advised by your doctor.`;
}

/** AI elder-friendly explanation in the chosen language, with a plain fallback. */
export async function generateElderFriendlyExplanation(
  medicationName: string,
  instructions: string,
  honorific: string = 'Amma',
  language: string = 'en'
): Promise<string> {
  try {
    const data = await apiPost<{ text: string }>('/api/ai/explain', {
      medicationName,
      instructions,
      honorific,
      language,
    });
    return data.text || fallbackExplanation(medicationName, honorific, language);
  } catch {
    return fallbackExplanation(medicationName, honorific, language);
  }
}
