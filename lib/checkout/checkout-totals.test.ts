import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeTotal, computeTotalGuests } from './checkout-totals.ts'
import type { Tour } from '../types/cms.ts'
import type { CheckoutContext, PricingCategory } from '../../app/api/bokun/checkout-context/route.ts'

// ─── Fixtures ─────────────────────────────────────────────────────────────

function tour(overrides: Partial<Tour> = {}): Tour {
  return {
    slug: 'el-yunque',
    name: 'El Yunque',
    price: 89,
    pricedPerPerson: true,
    bokunProductId: 448405,
    ...overrides,
  } as Tour
}

function category(id: number, defaultCategory = false): PricingCategory {
  return {
    id,
    title: `Cat ${id}`,
    ticketCategory: 'ADULT',
    defaultCategory,
  }
}

function ctxWith(...categories: PricingCategory[]): CheckoutContext {
  return {
    productId: 448405,
    title: 'El Yunque',
    meetingType: 'PICK_UP',
    pickupService: true,
    customPickupAllowed: false,
    startPoints: [],
    pricingCategories: categories,
    pickupPlaces: [],
    bookingQuestions: [],
    requiredCustomerFields: [],
    cancellationPolicy: { title: '24h' },
    content: {},
  } as CheckoutContext
}

// ─── computeTotalGuests ───────────────────────────────────────────────────

test('computeTotalGuests: empty {} returns 0', () => {
  assert.equal(computeTotalGuests({}), 0)
})

test('computeTotalGuests: sums positive integer counts', () => {
  assert.equal(computeTotalGuests({ 1: 2, 2: 3 }), 5)
})

test('computeTotalGuests: drops 0 / negative / NaN values defensively', () => {
  assert.equal(computeTotalGuests({ 1: 2, 2: 0, 3: -5, 4: NaN as number }), 2)
})

test('computeTotalGuests: handles a single category', () => {
  assert.equal(computeTotalGuests({ 100: 7 }), 7)
})

// ─── computeTotal — per-booking branch (private catamaran) ────────────────

test('computeTotal: per-booking tour returns tour.price flat (qty ignored)', () => {
  const t = tour({ pricedPerPerson: false, price: 249 })
  assert.equal(computeTotal(null, {}, t, new Map()), 249)
  assert.equal(
    computeTotal(ctxWith(category(1)), { 1: 5 }, t, new Map([[1, 100]])),
    249,
    'priceByCategory and qty are both ignored for per-booking',
  )
})

// ─── computeTotal — pre-context fallback ──────────────────────────────────

test('computeTotal: ctx=null with empty qty returns tour.price (1 guest implied)', () => {
  const t = tour({ price: 89 })
  assert.equal(computeTotal(null, {}, t, new Map()), 89)
})

test('computeTotal: ctx=null multiplies tour.price by total guests', () => {
  const t = tour({ price: 89 })
  assert.equal(computeTotal(null, { 1: 2, 2: 1 }, t, new Map()), 89 * 3)
})

// ─── computeTotal — per-person main path ──────────────────────────────────

test('computeTotal: sums qty × price across categories using priceByCategory', () => {
  const c = ctxWith(category(1), category(2))
  const prices = new Map([
    [1, 77], // Adult
    [2, 50], // Child
  ])
  // 2 adults @ 77 + 1 child @ 50 = 154 + 50 = 204
  assert.equal(computeTotal(c, { 1: 2, 2: 1 }, tour(), prices), 204)
})

test('computeTotal: missing category in priceByCategory falls back to tour.price', () => {
  const c = ctxWith(category(1), category(99))
  const prices = new Map([[1, 77]])
  // 1 @ 77 + 2 @ 89 (fallback) = 255
  assert.equal(computeTotal(c, { 1: 1, 99: 2 }, tour({ price: 89 }), prices), 255)
})

test('computeTotal: empty qty + ctx with categories returns 0', () => {
  const c = ctxWith(category(1), category(2))
  assert.equal(
    computeTotal(c, {}, tour(), new Map([[1, 77]])),
    0,
    'no guests booked → no charge',
  )
})

test('computeTotal: qty entries for unknown categories are ignored (only ctx categories count)', () => {
  const c = ctxWith(category(1))
  const prices = new Map([[1, 77]])
  // qty for category 999 isn't in ctx.pricingCategories → ignored
  assert.equal(computeTotal(c, { 1: 2, 999: 5 }, tour(), prices), 154)
})

test('computeTotal: zero-amount price in map (free category) is honored', () => {
  const c = ctxWith(category(1), category(2))
  const prices = new Map([
    [1, 77],
    [2, 0], // free child
  ])
  assert.equal(computeTotal(c, { 1: 1, 2: 3 }, tour(), prices), 77)
})

// ─── Determinism ──────────────────────────────────────────────────────────

test('pure: same inputs → same output (computeTotal)', () => {
  const c = ctxWith(category(1), category(2))
  const prices = new Map([[1, 77], [2, 50]])
  const t = tour()
  const a = computeTotal(c, { 1: 2, 2: 1 }, t, prices)
  const b = computeTotal(c, { 1: 2, 2: 1 }, t, prices)
  assert.equal(a, b)
})
