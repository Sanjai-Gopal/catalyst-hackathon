import type { Medication, TimeSlot } from '@/types/carenest'

/** Demo family/caretaker passcodes (client-side demo gate only). */
export const VALID_PASSCODES = [
  'CARE-8492',
  '8492',
  'CARE-2026',
  '2026',
] as const
export const MAX_PASSCODE_ATTEMPTS = 5
export const LOCKOUT_SECONDS = 30

/** Case/whitespace-insensitive passcode check. */
export function verifyPasscode(enteredCode: string): boolean {
  const clean = enteredCode.trim().toUpperCase()
  return (VALID_PASSCODES as readonly string[]).includes(clean)
}

/** Percentage (0-100) of scheduled doses taken. 100 when nothing is scheduled. */
export function calculateAdherencePercentage(
  totalMeds: number,
  takenCount: number
): number {
  if (totalMeds <= 0) return 100
  const pct = Math.round((takenCount / totalMeds) * 100)
  return Math.max(0, Math.min(100, pct))
}

export function filterMedicationsBySlot(
  meds: Medication[],
  slot: TimeSlot
): Medication[] {
  return meds.filter((m) => m.slot === slot)
}
