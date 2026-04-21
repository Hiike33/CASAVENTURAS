import type { BokunAvailability } from './types'

/**
 * Pure helpers for the AvailabilityCalendar component. Isolated here so
 * node:test can exercise them without loading any React / DOM module.
 *
 * Convention: a "date key" is a canonical `YYYY-MM-DD` string in UTC.
 * Bokun returns availability.date as ms-since-epoch at UTC midnight of
 * the tour day, so slicing the ISO string gives a stable key independent
 * of the browser's local timezone. That matches how the Bokun widget on
 * micasaventuras.com groups dates.
 */

/** Convert a Bokun availability.date (ms UTC) to the canonical YYYY-MM-DD key. */
export function toYMD(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

/** Group availabilities by date-key so the calendar UI can look up a day in O(1). */
export function buildAvailabilityMap(
  availabilities: ReadonlyArray<BokunAvailability>,
): Map<string, BokunAvailability[]> {
  const map = new Map<string, BokunAvailability[]>()
  for (const a of availabilities) {
    const key = toYMD(a.date)
    const existing = map.get(key)
    if (existing) existing.push(a)
    else map.set(key, [a])
  }
  return map
}

/**
 * A date is "available" if at least one Bokun slot on that day is NOT
 * soldout AND has availabilityCount > 0. Missing dates (no slots at all)
 * are treated as unavailable (disabled in the calendar).
 */
export function isDateAvailable(
  map: Map<string, BokunAvailability[]>,
  ymd: string,
): boolean {
  const slots = map.get(ymd)
  if (!slots || slots.length === 0) return false
  return slots.some(s => !s.soldOut && (s.availabilityCount ?? 0) > 0)
}

/**
 * Given any Date within a month, return the first and last day of that
 * month as YYYY-MM-DD strings (UTC). Used to build the Bokun API query
 * range for "fetch the whole visible month".
 */
export function monthStartEnd(ref: Date): { start: string; end: string } {
  const y = ref.getUTCFullYear()
  const m = ref.getUTCMonth()
  const startUTC = Date.UTC(y, m, 1)
  // Day 0 of next month = last day of current month
  const endUTC = Date.UTC(y, m + 1, 0)
  return { start: toYMD(startUTC), end: toYMD(endUTC) }
}

/**
 * Build the 42-cell grid (7 cols × 6 rows) needed to render a month with
 * leading / trailing days from adjacent months greyed out. The grid
 * starts on Monday by default (European convention, matches the Bokun
 * widget rendering on micasaventuras.com).
 *
 * Each cell carries :
 *   ymd       : canonical date key
 *   day       : 1..31 number to display
 *   inMonth   : whether the cell belongs to the target month
 */
export type CalendarCell = {
  ymd: string
  day: number
  inMonth: boolean
}

export function buildMonthGrid(ref: Date): CalendarCell[] {
  const y = ref.getUTCFullYear()
  const m = ref.getUTCMonth()
  // getUTCDay returns 0=Sun..6=Sat; convert so Monday=0..Sunday=6.
  const firstDow = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7
  // First Monday that covers the grid (may be in the previous month)
  const gridStartMs = Date.UTC(y, m, 1 - firstDow)
  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const ms = gridStartMs + i * 86_400_000
    const d = new Date(ms)
    cells.push({
      ymd: toYMD(ms),
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === m,
    })
  }
  return cells
}
