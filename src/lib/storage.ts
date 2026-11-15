import type {
  AdherenceRecord,
  Medication,
  PatientProfile,
} from '../types/carenest'

const SLOTS = ['morning', 'afternoon', 'evening', 'night']

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

export function isMedicationArray(v: unknown): v is Medication[] {
  return (
    Array.isArray(v) &&
    v.every(
      (m) =>
        isObject(m) &&
        typeof m.id === 'string' &&
        typeof m.name === 'string' &&
        typeof m.slot === 'string' &&
        SLOTS.includes(m.slot) &&
        typeof m.remainingPills === 'number' &&
        typeof m.totalPills === 'number'
    )
  )
}

export function isAdherenceArray(v: unknown): v is AdherenceRecord[] {
  return (
    Array.isArray(v) &&
    v.every(
      (a) =>
        isObject(a) &&
        typeof a.medicationId === 'string' &&
        typeof a.date === 'string' &&
        typeof a.status === 'string'
    )
  )
}

export function isPatientProfile(v: unknown): v is PatientProfile {
  return (
    isObject(v) &&
    typeof v.name === 'string' &&
    isObject(v.childrenContact) &&
    isObject(v.doctorContact) &&
    isObject(v.emergencyContact) &&
    Array.isArray(v.medicalConditions) &&
    Array.isArray(v.allergies)
  )
}

/**
 * Reads and JSON-parses a localStorage key, returning `fallback` when the key is
 * missing, the JSON is corrupt, OR the parsed value does not have the expected
 * shape. (Previously only JSON syntax errors were caught, so a valid-but-wrong
 * value such as `{}` crashed rendering on every page load.)
 */
export function loadValidated<T>(
  key: string,
  validate: (v: unknown) => v is T,
  fallback: T
): T {
  try {
    if (typeof window === 'undefined') return fallback
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    return validate(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}
