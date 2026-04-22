import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validatePromoRequestBody,
  rateLimitHit,
  clearRateLimiter,
  seedRateLimiter,
  RATE_LIMIT_MAX,
} from './promo-request.ts'

// ─── validatePromoRequestBody ─────────────────────────────────────────────

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    productId: 448405,
    startTimeId: 111,
    rateId: 222,
    date: '2026-05-15',
    passengersByCategory: { 10: 2 },
    subtotal: 267,
    promoCode: 'SUMMER10',
    ...overrides,
  }
}

test('validatePromoRequestBody: accepts a well-formed body', () => {
  assert.equal(validatePromoRequestBody(validBody()), null)
})

test('validatePromoRequestBody: rejects missing productId', () => {
  assert.equal(validatePromoRequestBody(validBody({ productId: undefined })), 'productId required')
  assert.equal(validatePromoRequestBody(validBody({ productId: 0 })), 'productId required')
})

test('validatePromoRequestBody: rejects missing startTimeId / rateId', () => {
  assert.equal(validatePromoRequestBody(validBody({ startTimeId: undefined })), 'startTimeId required')
  assert.equal(validatePromoRequestBody(validBody({ rateId: undefined })), 'rateId required')
})

test('validatePromoRequestBody: rejects malformed date', () => {
  assert.equal(validatePromoRequestBody(validBody({ date: undefined })), 'date (yyyy-MM-dd) required')
  assert.equal(validatePromoRequestBody(validBody({ date: '15/05/2026' })), 'date (yyyy-MM-dd) required')
  assert.equal(validatePromoRequestBody(validBody({ date: '2026-5-15' })), 'date (yyyy-MM-dd) required')
})

test('validatePromoRequestBody: rejects missing passengersByCategory', () => {
  assert.equal(
    validatePromoRequestBody(validBody({ passengersByCategory: undefined })),
    'passengersByCategory required',
  )
})

test('validatePromoRequestBody: rejects negative subtotal, accepts zero', () => {
  assert.equal(validatePromoRequestBody(validBody({ subtotal: undefined })), 'subtotal required (>= 0)')
  assert.equal(validatePromoRequestBody(validBody({ subtotal: -1 })), 'subtotal required (>= 0)')
  assert.equal(validatePromoRequestBody(validBody({ subtotal: 0 })), null)
})

test('validatePromoRequestBody: rejects missing or empty promoCode', () => {
  assert.equal(validatePromoRequestBody(validBody({ promoCode: undefined })), 'promoCode required')
  assert.equal(validatePromoRequestBody(validBody({ promoCode: '' })), 'promoCode required')
  assert.equal(validatePromoRequestBody(validBody({ promoCode: '   ' })), 'promoCode required')
})

// ─── rateLimitHit ─────────────────────────────────────────────────────────

test(`rateLimitHit: first ${RATE_LIMIT_MAX} hits pass, next is blocked`, () => {
  clearRateLimiter()
  const ip = '10.0.0.1'
  for (let i = 0; i < RATE_LIMIT_MAX; i++) {
    assert.equal(rateLimitHit(ip), false, `hit ${i + 1} should pass`)
  }
  assert.equal(rateLimitHit(ip), true, `hit ${RATE_LIMIT_MAX + 1} should block`)
})

test('rateLimitHit: different ips tracked independently', () => {
  clearRateLimiter()
  for (let i = 0; i < RATE_LIMIT_MAX; i++) rateLimitHit('10.0.0.2')
  assert.equal(rateLimitHit('10.0.0.3'), false)
})

test('rateLimitHit: window expiration frees the budget', () => {
  clearRateLimiter()
  const ip = '10.0.0.4'
  // Seed ancient timestamps (older than 60s window)
  const ancient = Date.now() - 120_000
  seedRateLimiter(ip, Array.from({ length: RATE_LIMIT_MAX }, () => ancient))
  assert.equal(rateLimitHit(ip), false, 'ancient hits should be evicted')
})

test('rateLimitHit: accepts injected `now` for deterministic window tests', () => {
  clearRateLimiter()
  const ip = '10.0.0.5'
  const t0 = 1_700_000_000_000
  for (let i = 0; i < RATE_LIMIT_MAX; i++) rateLimitHit(ip, t0 + i)
  assert.equal(rateLimitHit(ip, t0 + 100), true, 'same window, should block')
  assert.equal(rateLimitHit(ip, t0 + 120_000), false, 'after window, free again')
})
