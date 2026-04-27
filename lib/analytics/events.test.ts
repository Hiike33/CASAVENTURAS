import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { emit, track } from './events.ts'

// ─── gtag stub on globalThis.window — captures calls so we can assert on them
type GtagCall = unknown[]

function setupWindowStub(): { calls: GtagCall[] } {
  const calls: GtagCall[] = []
  const stub: { gtag: (...args: unknown[]) => void } = {
    gtag: (...args: unknown[]) => {
      calls.push(args)
    },
  }
  ;(globalThis as unknown as { window?: { gtag?: typeof stub.gtag } }).window = stub
  return { calls }
}

function clearWindow(): void {
  ;(globalThis as unknown as { window?: unknown }).window = undefined
}

let calls: GtagCall[] = []

beforeEach(() => {
  ;({ calls } = setupWindowStub())
})

afterEach(() => {
  clearWindow()
})

// ─── emit() — the low-level shim ──────────────────────────────────────────

test('emit: forwards to window.gtag with the GA4 "event" prefix', () => {
  emit('foo', { bar: 1 })
  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0], ['event', 'foo', { bar: 1 }])
})

test('emit: defaults params to {} when omitted', () => {
  emit('bar')
  assert.deepEqual(calls[0], ['event', 'bar', {}])
})

test('emit: no-op when window is undefined (SSR)', () => {
  clearWindow()
  assert.doesNotThrow(() => emit('x', { y: 1 }))
})

test('emit: no-op when window.gtag is undefined (no GA configured)', () => {
  ;(globalThis as unknown as { window: object }).window = {} // no gtag key
  assert.doesNotThrow(() => emit('x'))
})

// ─── track.tourView ───────────────────────────────────────────────────────

test('track.tourView: emits tour_view with tour_slug + locale', () => {
  track.tourView({ tourSlug: 'el-yunque', locale: 'en' })
  assert.deepEqual(calls[0], [
    'event',
    'tour_view',
    { tour_slug: 'el-yunque', locale: 'en' },
  ])
})

// ─── track.dateSelected ───────────────────────────────────────────────────

test('track.dateSelected: emits date_selected with days_ahead', () => {
  track.dateSelected({ tourSlug: 'catamaran', daysAhead: 14 })
  assert.deepEqual(calls[0], [
    'event',
    'date_selected',
    { tour_slug: 'catamaran', days_ahead: 14 },
  ])
})

// ─── track.beginCheckout ──────────────────────────────────────────────────

test('track.beginCheckout: emits begin_checkout with value + currency', () => {
  track.beginCheckout({ tourSlug: 'salsa', value: 65 })
  assert.deepEqual(calls[0], [
    'event',
    'begin_checkout',
    { tour_slug: 'salsa', value: 65, currency: 'USD' },
  ])
})

test('track.beginCheckout: respects explicit currency', () => {
  track.beginCheckout({ tourSlug: 'salsa', value: 60, currency: 'EUR' })
  const params = calls[0]?.[2] as { currency: string }
  assert.equal(params.currency, 'EUR')
})

// ─── track.promoApplied ───────────────────────────────────────────────────

test('track.promoApplied: emits valid + reason + discount when provided', () => {
  track.promoApplied({ code: 'SUMMER10', valid: true, discount: 10 })
  assert.deepEqual(calls[0], [
    'event',
    'promo_applied',
    { promo_code: 'SUMMER10', valid: true, discount: 10 },
  ])
})

test('track.promoApplied: omits undefined optional fields', () => {
  track.promoApplied({ code: 'BAD', valid: false })
  const params = calls[0]?.[2] as Record<string, unknown>
  assert.equal('reason' in params, false)
  assert.equal('discount' in params, false)
  assert.equal(params.valid, false)
})

test('track.promoApplied: includes invalidation reason when present', () => {
  track.promoApplied({ code: 'EXPIRED', valid: false, reason: 'expired' })
  const params = calls[0]?.[2] as Record<string, unknown>
  assert.equal(params.reason, 'expired')
})

// ─── track.bookingAttempt ─────────────────────────────────────────────────

test('track.bookingAttempt: emits booking_attempt with monetary value', () => {
  track.bookingAttempt({ tourSlug: 'el-yunque', value: 154 })
  assert.deepEqual(calls[0], [
    'event',
    'booking_attempt',
    { tour_slug: 'el-yunque', value: 154, currency: 'USD' },
  ])
})

// ─── track.purchase (GA4 standard event) ──────────────────────────────────

test('track.purchase: emits GA4-spec purchase with items[] + transaction_id', () => {
  track.purchase({
    tourSlug: 'el-yunque',
    value: 154,
    confirmationCode: 'CV-A1B2C3',
  })
  assert.deepEqual(calls[0], [
    'event',
    'purchase',
    {
      transaction_id: 'CV-A1B2C3',
      value: 154,
      currency: 'USD',
      items: [
        {
          item_id: 'el-yunque',
          item_name: 'el-yunque',
          price: 154,
          quantity: 1,
        },
      ],
    },
  ])
})

test('track.purchase: respects explicit currency', () => {
  track.purchase({
    tourSlug: 'salsa',
    value: 50,
    currency: 'CAD',
    confirmationCode: 'CV-X',
  })
  const params = calls[0]?.[2] as { currency: string; items: { price: number }[] }
  assert.equal(params.currency, 'CAD')
  assert.equal(params.items[0].price, 50)
})

// ─── Funnel — 3 events fire in correct order without throwing ─────────────

test('integration: full funnel fires 4 events with consistent tour_slug', () => {
  track.tourView({ tourSlug: 'salsa', locale: 'es' })
  track.dateSelected({ tourSlug: 'salsa', daysAhead: 7 })
  track.beginCheckout({ tourSlug: 'salsa', value: 65 })
  track.purchase({ tourSlug: 'salsa', value: 65, confirmationCode: 'CV-FUNNEL' })

  assert.equal(calls.length, 4)
  assert.equal(calls[0]?.[1], 'tour_view')
  assert.equal(calls[1]?.[1], 'date_selected')
  assert.equal(calls[2]?.[1], 'begin_checkout')
  assert.equal(calls[3]?.[1], 'purchase')

  // Every call references the same tour
  for (const c of calls) {
    const params = c[2] as Record<string, unknown> | undefined
    if (params && 'tour_slug' in params) {
      assert.equal(params.tour_slug, 'salsa')
    } else if (params && 'items' in params) {
      // purchase event puts the slug in items[0].item_id
      const items = params.items as { item_id: string }[]
      assert.equal(items[0].item_id, 'salsa')
    }
  }
})
