import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildActivityBookingPayload,
  classifyPromoError,
  computeBreakdown,
  generateCartSessionId,
  parseShoppingCartCurrency,
  parseShoppingCartTotal,
} from './cart.ts'

// ─── generateCartSessionId ────────────────────────────────────────────────

test('generateCartSessionId returns a UUID v4-shaped string', () => {
  const id = generateCartSessionId()
  assert.match(
    id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    `expected UUID v4, got: ${id}`,
  )
})

test('generateCartSessionId yields different ids on repeated calls', () => {
  const a = generateCartSessionId()
  const b = generateCartSessionId()
  assert.notEqual(a, b)
})

// ─── buildActivityBookingPayload ──────────────────────────────────────────

test('buildActivityBookingPayload materializes one passenger per unit per category', () => {
  const payload = buildActivityBookingPayload({
    productId: 448405,
    startTimeId: 111,
    rateId: 222,
    date: '2026-05-15',
    passengersByCategory: { 10: 2, 20: 1 },
  })
  assert.equal(payload.activityId, 448405)
  assert.equal(payload.startTimeId, 111)
  assert.equal(payload.rateId, 222)
  assert.equal(payload.date, '2026-05-15')
  assert.equal(payload.passengers.length, 3)
  assert.deepEqual(payload.passengers, [
    { pricingCategoryId: 10 },
    { pricingCategoryId: 10 },
    { pricingCategoryId: 20 },
  ])
})

test('buildActivityBookingPayload clamps negative or non-integer quantities', () => {
  const payload = buildActivityBookingPayload({
    productId: 1,
    startTimeId: 1,
    rateId: 1,
    date: '2026-05-15',
    passengersByCategory: { 10: -2, 20: 2.7 },
  })
  // -2 → 0 passengers, 2.7 → floor → 2 passengers
  assert.equal(payload.passengers.length, 2)
  assert.deepEqual(payload.passengers, [
    { pricingCategoryId: 20 },
    { pricingCategoryId: 20 },
  ])
})

test('buildActivityBookingPayload returns empty passengers when map empty', () => {
  const payload = buildActivityBookingPayload({
    productId: 1,
    startTimeId: 1,
    rateId: 1,
    date: '2026-05-15',
    passengersByCategory: {},
  })
  assert.equal(payload.passengers.length, 0)
})

// ─── computeBreakdown ─────────────────────────────────────────────────────

test('computeBreakdown: nominal case', () => {
  assert.deepEqual(computeBreakdown(267, 240.3, 'USD'), {
    subtotal: 267,
    discount: 26.7,
    total: 240.3,
    currency: 'USD',
  })
})

test('computeBreakdown: zero discount when subtotal === total', () => {
  assert.deepEqual(computeBreakdown(100, 100, 'USD'), {
    subtotal: 100,
    discount: 0,
    total: 100,
    currency: 'USD',
  })
})

test('computeBreakdown clamps total to subtotal (guards upstream quirks)', () => {
  // If upstream returns total > subtotal (shouldn't happen but defend),
  // clamp total = subtotal, discount = 0.
  assert.deepEqual(computeBreakdown(100, 150, 'USD'), {
    subtotal: 100,
    discount: 0,
    total: 100,
    currency: 'USD',
  })
})

test('computeBreakdown clamps negative inputs to zero', () => {
  assert.deepEqual(computeBreakdown(-5, -10, 'USD'), {
    subtotal: 0,
    discount: 0,
    total: 0,
    currency: 'USD',
  })
})

test('computeBreakdown handles NaN safely', () => {
  const b = computeBreakdown(NaN, 50, 'USD')
  assert.equal(b.subtotal, 0)
  assert.equal(b.total, 0)
  assert.equal(b.discount, 0)
})

test('computeBreakdown rounds discount to cents (no float noise)', () => {
  // 100 - 66.666666 should give a clean 33.33 discount after rounding.
  const b = computeBreakdown(100, 66.666666, 'USD')
  assert.equal(b.discount, 33.33)
})

// ─── parseShoppingCartTotal ───────────────────────────────────────────────

test('parseShoppingCartTotal prefers totalPrice', () => {
  assert.equal(
    parseShoppingCartTotal({ totalPrice: 240, totalDue: 200 }),
    240,
  )
})

test('parseShoppingCartTotal falls back to totalDue when totalPrice missing', () => {
  assert.equal(parseShoppingCartTotal({ totalDue: 200 }), 200)
})

test('parseShoppingCartTotal returns null for empty / malformed', () => {
  assert.equal(parseShoppingCartTotal(null), null)
  assert.equal(parseShoppingCartTotal(undefined), null)
  assert.equal(parseShoppingCartTotal('not an object'), null)
  assert.equal(parseShoppingCartTotal({}), null)
  assert.equal(parseShoppingCartTotal({ totalPrice: 'nope' }), null)
})

// ─── parseShoppingCartCurrency ────────────────────────────────────────────

test('parseShoppingCartCurrency returns currency when present', () => {
  assert.equal(parseShoppingCartCurrency({ currency: 'EUR' }), 'EUR')
})

test('parseShoppingCartCurrency defaults to USD when missing', () => {
  assert.equal(parseShoppingCartCurrency({}), 'USD')
  assert.equal(parseShoppingCartCurrency(null), 'USD')
  assert.equal(parseShoppingCartCurrency({ currency: '' }), 'USD')
})

// ─── classifyPromoError ───────────────────────────────────────────────────

test('classifyPromoError: 404 → invalid_code', () => {
  assert.equal(classifyPromoError(404, ''), 'invalid_code')
})

test('classifyPromoError: expired keyword → expired', () => {
  assert.equal(classifyPromoError(400, 'This promo code has expired'), 'expired')
  assert.equal(classifyPromoError(410, ''), 'expired')
  assert.equal(classifyPromoError(400, 'code is inactive'), 'expired')
})

test('classifyPromoError: minimum keyword → min_not_met', () => {
  assert.equal(
    classifyPromoError(400, 'Minimum subtotal not met'),
    'min_not_met',
  )
  assert.equal(
    classifyPromoError(400, 'Amount below minimum'),
    'min_not_met',
  )
})

test('classifyPromoError: usage/limit → usage_limit', () => {
  assert.equal(
    classifyPromoError(400, 'Usage limit exhausted'),
    'usage_limit',
  )
  assert.equal(classifyPromoError(400, 'quota reached'), 'usage_limit')
})

test('classifyPromoError: not eligible / product → product_not_eligible', () => {
  assert.equal(
    classifyPromoError(400, 'Not eligible for this activity'),
    'product_not_eligible',
  )
  assert.equal(
    classifyPromoError(400, 'not applicable to product'),
    'product_not_eligible',
  )
})

test('classifyPromoError: unknown → invalid_code (safe default)', () => {
  assert.equal(classifyPromoError(500, 'mystery error'), 'invalid_code')
  assert.equal(classifyPromoError(undefined, undefined), 'invalid_code')
})
