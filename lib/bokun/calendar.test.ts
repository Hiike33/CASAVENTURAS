import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { BokunAvailability } from './types.ts'
import {
  buildAvailabilityMap,
  isDateAvailable,
  monthStartEnd,
  toYMD,
} from './calendar.ts'

// Helper: minimal BokunAvailability factory
function slot(dateISO: string, overrides: Partial<BokunAvailability> = {}): BokunAvailability {
  // Parse YYYY-MM-DD as UTC midnight
  const ms = Date.parse(`${dateISO}T00:00:00Z`)
  return {
    id: overrides.id ?? `slot_${dateISO}`,
    activityId: 448405,
    date: ms,
    availabilityCount: 10,
    soldOut: false,
    ...overrides,
  }
}

// ─── toYMD ────────────────────────────────────────────────────────────────

test('toYMD: converts ms UTC midnight to YYYY-MM-DD', () => {
  assert.equal(toYMD(Date.parse('2026-04-22T00:00:00Z')), '2026-04-22')
  assert.equal(toYMD(Date.parse('2026-01-01T00:00:00Z')), '2026-01-01')
  assert.equal(toYMD(Date.parse('2026-12-31T00:00:00Z')), '2026-12-31')
})

test('toYMD: returns ISO date part even for non-midnight timestamps', () => {
  // Bokun sometimes returns mid-day UTC values , we still want the date part
  assert.equal(toYMD(Date.parse('2026-04-22T14:30:00Z')), '2026-04-22')
})

// ─── buildAvailabilityMap ─────────────────────────────────────────────────

test('buildAvailabilityMap: groups slots by date YYYY-MM-DD', () => {
  const slots: BokunAvailability[] = [
    slot('2026-04-22', { id: 'a', availabilityCount: 7 }),
    slot('2026-04-22', { id: 'b', availabilityCount: 13 }),
    slot('2026-04-23', { id: 'c', availabilityCount: 5 }),
  ]
  const map = buildAvailabilityMap(slots)
  assert.equal(map.size, 2)
  assert.equal(map.get('2026-04-22')?.length, 2)
  assert.equal(map.get('2026-04-23')?.length, 1)
})

test('buildAvailabilityMap: empty input → empty map', () => {
  assert.equal(buildAvailabilityMap([]).size, 0)
})

// ─── isDateAvailable ──────────────────────────────────────────────────────

test('isDateAvailable: true when at least one slot has spots and is not soldout', () => {
  const map = buildAvailabilityMap([slot('2026-04-22', { availabilityCount: 7, soldOut: false })])
  assert.equal(isDateAvailable(map, '2026-04-22'), true)
})

test('isDateAvailable: false when date has no entry', () => {
  const map = buildAvailabilityMap([slot('2026-04-22')])
  assert.equal(isDateAvailable(map, '2026-04-23'), false)
})

test('isDateAvailable: false when all slots are sold out', () => {
  const map = buildAvailabilityMap([
    slot('2026-04-22', { id: 'a', soldOut: true, availabilityCount: 0 }),
    slot('2026-04-22', { id: 'b', soldOut: true, availabilityCount: 0 }),
  ])
  assert.equal(isDateAvailable(map, '2026-04-22'), false)
})

test('isDateAvailable: false when availabilityCount is 0 even if not soldout flag', () => {
  const map = buildAvailabilityMap([slot('2026-04-22', { availabilityCount: 0, soldOut: false })])
  assert.equal(isDateAvailable(map, '2026-04-22'), false)
})

test('isDateAvailable: true when mixed (some soldout, some not)', () => {
  const map = buildAvailabilityMap([
    slot('2026-04-22', { id: 'a', soldOut: true, availabilityCount: 0 }),
    slot('2026-04-22', { id: 'b', soldOut: false, availabilityCount: 5 }),
  ])
  assert.equal(isDateAvailable(map, '2026-04-22'), true)
})

// ─── monthStartEnd ────────────────────────────────────────────────────────

test('monthStartEnd: returns first and last day of the given month', () => {
  const r = monthStartEnd(new Date('2026-04-15T10:00:00Z'))
  assert.equal(r.start, '2026-04-01')
  assert.equal(r.end, '2026-04-30')
})

test('monthStartEnd: handles February correctly (non-leap)', () => {
  const r = monthStartEnd(new Date('2026-02-10T00:00:00Z'))
  assert.equal(r.start, '2026-02-01')
  assert.equal(r.end, '2026-02-28')
})

test('monthStartEnd: handles January and December', () => {
  const jan = monthStartEnd(new Date('2026-01-15T00:00:00Z'))
  assert.equal(jan.start, '2026-01-01')
  assert.equal(jan.end, '2026-01-31')
  const dec = monthStartEnd(new Date('2026-12-31T00:00:00Z'))
  assert.equal(dec.start, '2026-12-01')
  assert.equal(dec.end, '2026-12-31')
})
