import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  simulatePromoValidation,
  DEV_MOCK_CODES,
} from './promo-devmock.ts'

// ─── Catalog sanity ───────────────────────────────────────────────────────

test('DEV_MOCK_CODES includes the documented scenarios', () => {
  for (const code of ['SUMMER10', 'WELCOME20', 'FLAT25', 'EXPIRED', 'SOLDOUT']) {
    assert.ok(
      DEV_MOCK_CODES.includes(code),
      `dev-mock catalog missing "${code}" — UX scenarios depend on it`,
    )
  }
})

// ─── Invalid / empty inputs ───────────────────────────────────────────────

test('empty or whitespace-only code → invalid_code', () => {
  assert.deepEqual(simulatePromoValidation('', 100), {
    valid: false,
    reason: 'invalid_code',
  })
  assert.deepEqual(simulatePromoValidation('   ', 100), {
    valid: false,
    reason: 'invalid_code',
  })
})

test('unknown code → invalid_code (echoes normalized code)', () => {
  const r = simulatePromoValidation('NOPE123', 100)
  assert.equal(r.valid, false)
  if (!r.valid) {
    assert.equal(r.reason, 'invalid_code')
    assert.equal(r.code, 'NOPE123')
  }
})

// ─── Percent off ──────────────────────────────────────────────────────────

test('SUMMER10 applies 10% off', () => {
  const r = simulatePromoValidation('SUMMER10', 267)
  assert.equal(r.valid, true)
  if (r.valid) {
    assert.equal(r.code, 'SUMMER10')
    // 10% of 267 = 26.70
    assert.equal(r.discount, 26.7)
  }
})

test('SUMMER10 discount never exceeds subtotal (edge: subtotal=0)', () => {
  const r = simulatePromoValidation('SUMMER10', 0)
  assert.equal(r.valid, true)
  if (r.valid) assert.equal(r.discount, 0)
})

// ─── Minimum subtotal ─────────────────────────────────────────────────────

test('WELCOME20 rejected when subtotal below $100', () => {
  const r = simulatePromoValidation('WELCOME20', 99)
  assert.equal(r.valid, false)
  if (!r.valid) {
    assert.equal(r.reason, 'min_not_met')
    assert.equal(r.minSubtotal, 100)
    assert.equal(r.code, 'WELCOME20')
  }
})

test('WELCOME20 applies 20% off when subtotal >= $100', () => {
  const r = simulatePromoValidation('WELCOME20', 150)
  assert.equal(r.valid, true)
  if (r.valid) assert.equal(r.discount, 30)
})

test('FLAT25 applies $25 flat off when subtotal >= $50', () => {
  const r = simulatePromoValidation('FLAT25', 200)
  assert.equal(r.valid, true)
  if (r.valid) assert.equal(r.discount, 25)
})

test('FLAT25 rejected when subtotal below $50', () => {
  const r = simulatePromoValidation('FLAT25', 49)
  assert.equal(r.valid, false)
  if (!r.valid) assert.equal(r.reason, 'min_not_met')
})

// ─── Forced-error codes ───────────────────────────────────────────────────

test('EXPIRED always fails with reason=expired', () => {
  const r = simulatePromoValidation('EXPIRED', 1000)
  assert.equal(r.valid, false)
  if (!r.valid) assert.equal(r.reason, 'expired')
})

test('SOLDOUT always fails with reason=usage_limit', () => {
  const r = simulatePromoValidation('SOLDOUT', 1000)
  assert.equal(r.valid, false)
  if (!r.valid) assert.equal(r.reason, 'usage_limit')
})

// ─── Case-insensitivity & whitespace handling ─────────────────────────────

test('case-insensitive lookup (summer10 → SUMMER10)', () => {
  const r = simulatePromoValidation('summer10', 100)
  assert.equal(r.valid, true)
  if (r.valid) assert.equal(r.code, 'SUMMER10')
})

test('trims surrounding whitespace', () => {
  const r = simulatePromoValidation('  SUMMER10  ', 100)
  assert.equal(r.valid, true)
})

// ─── Determinism ──────────────────────────────────────────────────────────

test('same inputs → same result (pure function)', () => {
  const a = simulatePromoValidation('SUMMER10', 267)
  const b = simulatePromoValidation('SUMMER10', 267)
  assert.deepEqual(a, b)
})
