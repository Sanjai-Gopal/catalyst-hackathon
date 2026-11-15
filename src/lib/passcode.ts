/**
 * Caregiver passcode check, shared by the UI and the tests so the tests
 * exercise the real implementation (not a copy).
 *
 * NOTE: this is a client-side demo gate, not real authentication. Anyone can
 * read these values from the shipped JavaScript. Replace with server-verified
 * auth (e.g. an Appwrite session + role check) before real patient use.
 */
const VALID_PASSCODES: readonly string[] = [
  'CARE-8492',
  '8492',
  'CARE-2026',
  '2026',
]

export function verifyPasscode(entered: string): boolean {
  const clean = (entered ?? '').trim().toUpperCase()
  return VALID_PASSCODES.includes(clean)
}
