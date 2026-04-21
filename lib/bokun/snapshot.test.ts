import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { Tour } from '../types/cms.ts'
import type { BokunTourSnapshot } from './snapshot.ts'
import { enrichToursWithSnapshot, deriveCancellationHours, getBookingTotal } from './snapshot.ts'

// Minimal Tour factory — only the fields enrichment actually touches, plus
// the bare required-by-type fields. Keeps tests readable.
function tour(partial: Partial<Tour> & Pick<Tour, 'slug'>): Tour {
  const defaults = {
    name: `${partial.slug} tour`,
    shortName: partial.slug,
    category: 'Adventure',
    tagColor: '#000000',
    thumbBg: '#111111',
    price: 100,
    priceNote: 'per person',
    duration: '3h',
    groupSize: '≤ 10',
    description: 'desc',
    highlights: [] as string[],
    heroTag: 'hero',
    photos: [] as string[],
  }
  return { ...defaults, ...partial } as Tour
}

// ─── enrichToursWithSnapshot ──────────────────────────────────────────────

test('returns tours untouched when snapshot is empty', () => {
  const tours: Tour[] = [tour({ slug: 'el-yunque', price: 89 })]
  const out = enrichToursWithSnapshot(tours, {})
  assert.equal(out.length, 1)
  assert.equal(out[0].price, 89)
  assert.equal(out[0].bokunSnapshot, undefined)
})

test('returns tours untouched when snapshot has no matching slug', () => {
  const tours: Tour[] = [tour({ slug: 'catamaran', price: 249 })]
  const out = enrichToursWithSnapshot(tours, { 'el-yunque': stubSnap(89) })
  assert.equal(out[0].price, 249)
  assert.equal(out[0].bokunSnapshot, undefined)
})

test('attaches snapshot without mutating tour.price (Phase 1 policy)', () => {
  const tours: Tour[] = [tour({ slug: 'el-yunque', price: 89 })]
  const out = enrichToursWithSnapshot(tours, { 'el-yunque': stubSnap(24) })
  assert.equal(out[0].price, 89, 'CMS price must be preserved — price override is deferred')
  assert.equal(out[0].bokunSnapshot?.cancellationHours, 24)
})

test('preserves other CMS fields (name, highlights) when attaching snapshot', () => {
  const tours: Tour[] = [
    tour({ slug: 'el-yunque', price: 89, name: 'El Yunque Vivid Day', highlights: ['a', 'b'] }),
  ]
  const out = enrichToursWithSnapshot(tours, { 'el-yunque': stubSnap(24) })
  assert.equal(out[0].name, 'El Yunque Vivid Day')
  assert.deepEqual(out[0].highlights, ['a', 'b'])
})

test('enriches multiple tours selectively — only ones present in snapshot', () => {
  const tours: Tour[] = [
    tour({ slug: 'el-yunque', price: 89 }),
    tour({ slug: 'catamaran', price: 249 }),
    tour({ slug: 'salsa', price: 65 }),
  ]
  const out = enrichToursWithSnapshot(tours, {
    'el-yunque': stubSnap(24),
    salsa: stubSnap(48),
  })
  assert.equal(out[0].bokunSnapshot?.cancellationHours, 24, 'el-yunque: attached')
  assert.equal(out[1].bokunSnapshot, undefined, 'catamaran: untouched (not in snapshot)')
  assert.equal(out[2].bokunSnapshot?.cancellationHours, 48, 'salsa: attached')
  assert.equal(out[0].price, 89, 'prices preserved')
  assert.equal(out[1].price, 249)
  assert.equal(out[2].price, 65)
})

test('carries cancellationHours, startTimes, pricingCategories, ratePrices', () => {
  const tours: Tour[] = [tour({ slug: 'el-yunque', price: 89 })]
  const snap: BokunTourSnapshot = {
    productId: 448405,
    cancellationHours: 48,
    startTimes: ['08:00', '09:30'],
    pricingCategories: [
      { id: 1, title: 'Adult', ticketCategory: 'ADULT' },
      { id: 2, title: 'Child', ticketCategory: 'CHILD', minAge: 3, maxAge: 11 },
    ],
    ratePrices: [
      {
        activityRateId: 918982,
        pricedPerPerson: true,
        pricePerCategoryUnit: [
          { categoryId: 1, amount: 80, currency: 'USD' },
          { categoryId: 2, amount: 80, currency: 'USD' },
        ],
      },
    ],
    fetchedAt: '2026-04-20T12:00:00Z',
  }
  const out = enrichToursWithSnapshot(tours, { 'el-yunque': snap })
  assert.equal(out[0].bokunSnapshot?.cancellationHours, 48)
  assert.deepEqual(out[0].bokunSnapshot?.startTimes, ['08:00', '09:30'])
  assert.equal(out[0].bokunSnapshot?.pricingCategories?.length, 2)
  assert.equal(out[0].bokunSnapshot?.ratePrices?.length, 1)
  assert.equal(out[0].bokunSnapshot?.ratePrices?.[0].pricePerCategoryUnit?.[0].amount, 80)
})

// ─── price override from Bokun (Phase 5) ─────────────────────────────────
// Bokun widget on micasaventuras.com shows the retail price; the CMS
// `price` field becomes a fallback when no snapshot is available. Phase 5
// wires the adapter to override `price` + `pricedPerPerson` from the live
// ratePrices entry, so every UI surface transparently picks up the retail
// number without per-component changes.

test('enrichment overrides price from ratePrices per-person rate', () => {
  const tours: Tour[] = [tour({ slug: 'el-yunque', price: 89 })]
  const snap: BokunTourSnapshot = {
    productId: 448405,
    ratePrices: [
      {
        activityRateId: 918982,
        pricedPerPerson: true,
        pricePerCategoryUnit: [
          { categoryId: 725662, amount: 80, currency: 'USD' },
          { categoryId: 801219, amount: 80, currency: 'USD' },
        ],
      },
    ],
    fetchedAt: '2026-04-20T12:00:00Z',
  }
  const out = enrichToursWithSnapshot(tours, { 'el-yunque': snap })
  assert.equal(out[0].price, 80, 'price should follow Bokun ADULT retail rate')
  assert.equal(out[0].pricedPerPerson, true)
})

test('enrichment overrides price + sets pricedPerPerson=false for flat rate', () => {
  const tours: Tour[] = [tour({ slug: 'catamaran', price: 249 })]
  const snap: BokunTourSnapshot = {
    productId: 1134501,
    ratePrices: [
      {
        activityRateId: 2252193,
        pricedPerPerson: false,
        pricePerBooking: { amount: 1650, currency: 'USD' },
      },
    ],
    fetchedAt: '2026-04-20T12:00:00Z',
  }
  const out = enrichToursWithSnapshot(tours, { catamaran: snap })
  assert.equal(out[0].price, 1650, 'price should be the flat booking fee')
  assert.equal(out[0].pricedPerPerson, false)
})

test('enrichment leaves CMS price untouched when ratePrices absent', () => {
  const tours: Tour[] = [tour({ slug: 'orphan', price: 99 })]
  const snap: BokunTourSnapshot = {
    productId: 0,
    cancellationHours: 24,
    fetchedAt: '2026-04-20T12:00:00Z',
  }
  const out = enrichToursWithSnapshot(tours, { orphan: snap })
  assert.equal(out[0].price, 99, 'no ratePrices → keep CMS price')
})

// ─── getBookingTotal ──────────────────────────────────────────────────────

test('getBookingTotal: per-person tour multiplies price by guests', () => {
  const t = tour({ slug: 'el-yunque', price: 80 }) // pricedPerPerson defaults to undefined (= truthy treated as per-person)
  assert.equal(getBookingTotal(t, 2), 160)
  assert.equal(getBookingTotal(t, 1), 80)
  assert.equal(getBookingTotal(t, 13), 1040)
})

test('getBookingTotal: flat-fee tour ignores guest count', () => {
  const t: Tour = { ...tour({ slug: 'catamaran', price: 1650 }), pricedPerPerson: false }
  assert.equal(getBookingTotal(t, 1), 1650)
  assert.equal(getBookingTotal(t, 12), 1650)
  assert.equal(getBookingTotal(t, 50), 1650)
})

test('getBookingTotal: guard clamps guests to >=1', () => {
  const t = tour({ slug: 'el-yunque', price: 80 })
  assert.equal(getBookingTotal(t, 0), 80)
  assert.equal(getBookingTotal(t, -5), 80)
  assert.equal(getBookingTotal(t, Number.NaN), 80)
})

// ─── deriveCancellationHours ──────────────────────────────────────────────

test('deriveCancellationHours: single non-zero charge rule → returns its cutoff', () => {
  const rules = [{ cutoffHours: 24, charge: 100 }, { cutoffHours: 24000, charge: 0 }]
  assert.equal(deriveCancellationHours(rules), 24)
})

test('deriveCancellationHours: multiple charge rules → smallest cutoff', () => {
  const rules = [
    { cutoffHours: 48, charge: 50 },
    { cutoffHours: 24, charge: 100 },
    { cutoffHours: 72, charge: 25 },
  ]
  assert.equal(deriveCancellationHours(rules), 24)
})

test('deriveCancellationHours: all zero charges → undefined', () => {
  const rules = [{ cutoffHours: 24, charge: 0 }, { cutoffHours: 48, charge: 0 }]
  assert.equal(deriveCancellationHours(rules), undefined)
})

test('deriveCancellationHours: empty rules → undefined', () => {
  assert.equal(deriveCancellationHours([]), undefined)
  assert.equal(deriveCancellationHours(undefined), undefined)
})

// ─── helpers ──────────────────────────────────────────────────────────────

function stubSnap(cancellationHours: number): BokunTourSnapshot {
  return {
    productId: 0,
    cancellationHours,
    fetchedAt: '2026-04-20T00:00:00Z',
  }
}
