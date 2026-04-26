import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeMinStartingPrice } from './live-prices.ts'
import type { BokunAvailability } from './types.ts'

// Minimal fixtures mirroring the real Bokun availability response shape
// (lib/bokun/types.ts:6-48). Only the fields computeMinStartingPrice
// reads are populated — the rest is `as` casted to keep the fixtures
// readable.

function slot(overrides: Partial<BokunAvailability> = {}): BokunAvailability {
  return {
    id: 'slot-1',
    activityId: 448405,
    date: 1777334400000,
    availabilityCount: 5,
    soldOut: false,
    ...overrides,
  } as BokunAvailability
}

function perPersonRate(amounts: number[]) {
  return {
    activityRateId: 918982,
    pricePerCategoryUnit: amounts.map((amount, i) => ({
      id: 700000 + i,
      amount: { amount, currency: 'USD' },
    })),
  }
}

function perBookingRate(amount: number) {
  return {
    activityRateId: 1000001,
    pricePerBooking: { amount, currency: 'USD' },
  }
}

// ─── Empty / sentinel cases ───────────────────────────────────────────────

test('returns null for empty slot list', () => {
  assert.equal(computeMinStartingPrice([]), null)
})

test('returns null when all slots are soldOut', () => {
  const slots = [
    slot({ soldOut: true, pricesByRate: [perPersonRate([77])] }),
    slot({ soldOut: true, pricesByRate: [perPersonRate([99])] }),
  ]
  assert.equal(computeMinStartingPrice(slots), null)
})

test('returns null when all slots are flagged unavailable', () => {
  const slots = [
    slot({ unavailable: true, pricesByRate: [perPersonRate([77])] }),
  ]
  assert.equal(computeMinStartingPrice(slots), null)
})

test('returns null when slots have no pricesByRate at all', () => {
  assert.equal(computeMinStartingPrice([slot({ pricesByRate: undefined })]), null)
  assert.equal(computeMinStartingPrice([slot({ pricesByRate: [] })]), null)
})

// ─── Happy path ───────────────────────────────────────────────────────────

test('returns the only price when there is exactly one valid amount', () => {
  const slots = [slot({ pricesByRate: [perPersonRate([77])] })]
  assert.equal(computeMinStartingPrice(slots), 77)
})

test('returns minimum across categories within a single rate', () => {
  const slots = [slot({ pricesByRate: [perPersonRate([77, 50, 99])] })]
  assert.equal(computeMinStartingPrice(slots), 50)
})

test('returns minimum across multiple rates within a slot', () => {
  const slots = [
    slot({
      pricesByRate: [
        perPersonRate([100, 100]),
        perPersonRate([60, 80]), // ← min lives here
      ],
    }),
  ]
  assert.equal(computeMinStartingPrice(slots), 60)
})

test('returns minimum across multiple slots', () => {
  const slots = [
    slot({ pricesByRate: [perPersonRate([100])] }),
    slot({ id: 'slot-2', pricesByRate: [perPersonRate([85])] }),
    slot({ id: 'slot-3', pricesByRate: [perPersonRate([120])] }),
  ]
  assert.equal(computeMinStartingPrice(slots), 85)
})

// ─── Per-booking pricing (private charters) ───────────────────────────────

test('handles pricePerBooking (flat-fee tours like the catamaran)', () => {
  const slots = [slot({ pricesByRate: [perBookingRate(2200)] })]
  assert.equal(computeMinStartingPrice(slots), 2200)
})

test('mixes per-person and per-booking rates: min wins regardless of mode', () => {
  const slots = [
    slot({
      pricesByRate: [perPersonRate([300]), perBookingRate(2200)],
    }),
  ]
  assert.equal(computeMinStartingPrice(slots), 300)
})

// ─── Defensive parsing (anti-crash on malformed Bokun output) ─────────────

test('ignores amount = 0 (treated as missing data, not "free")', () => {
  const slots = [slot({ pricesByRate: [perPersonRate([0, 77])] })]
  assert.equal(computeMinStartingPrice(slots), 77)
})

test('ignores NaN and Infinity amounts', () => {
  const slots = [
    slot({
      pricesByRate: [
        {
          activityRateId: 1,
          pricePerCategoryUnit: [
            { id: 1, amount: { amount: NaN, currency: 'USD' } },
            { id: 2, amount: { amount: Infinity, currency: 'USD' } },
            { id: 3, amount: { amount: 77, currency: 'USD' } },
          ],
        },
      ],
    }),
  ]
  assert.equal(computeMinStartingPrice(slots), 77)
})

test('ignores negative amounts (Bokun never returns these but be defensive)', () => {
  const slots = [
    slot({
      pricesByRate: [
        {
          activityRateId: 1,
          pricePerCategoryUnit: [
            { id: 1, amount: { amount: -10, currency: 'USD' } },
            { id: 2, amount: { amount: 77, currency: 'USD' } },
          ],
        },
      ],
    }),
  ]
  assert.equal(computeMinStartingPrice(slots), 77)
})

test('non-array input is treated as no slots (returns null)', () => {
  assert.equal(
    computeMinStartingPrice(null as unknown as BokunAvailability[]),
    null,
  )
  assert.equal(
    computeMinStartingPrice(
      'oops' as unknown as BokunAvailability[],
    ),
    null,
  )
})

// ─── Determinism ──────────────────────────────────────────────────────────

test('pure: same input → same output', () => {
  const slots = [
    slot({ pricesByRate: [perPersonRate([77, 99]), perBookingRate(2200)] }),
    slot({ id: 'slot-2', pricesByRate: [perPersonRate([60, 120])] }),
  ]
  const a = computeMinStartingPrice(slots)
  const b = computeMinStartingPrice(slots)
  assert.equal(a, b)
  assert.equal(a, 60)
})
