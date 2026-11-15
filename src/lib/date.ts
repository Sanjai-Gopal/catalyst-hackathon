/**
 * Returns the calendar date (YYYY-MM-DD) in the user's LOCAL timezone.
 *
 * `new Date().toISOString().split('T')[0]` returns the UTC date, which for users
 * in India (UTC+05:30) is still "yesterday" between 00:00 and 05:30 — doses were
 * being recorded against the wrong day.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
