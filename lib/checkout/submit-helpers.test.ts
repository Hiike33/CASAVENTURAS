import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  validateSubmitPreflight,
  buildSubmitBody,
  checkPriceMismatch,
  type CheckoutFormState,
} from './submit-helpers.ts'
import type { CheckoutContext } from '../../app/api/bokun/checkout-context/route.ts'

// ─── Fixtures ─────────────────────────────────────────────────────────────

function form(overrides: Partial<CheckoutFormState> = {}): CheckoutFormState {
  return {
    firstName: 'Diag',
    lastName: 'CCS',
    email: 'diag@example.com',
    phone: '+19295551234',
    pickupId: null,
    pickupTitle: '',
    roomNumber: '',
    customPickup: false,
    customPickupAddress: '',
    customPickupLat: undefined,
    customPickupLon: undefined,
    answers: {},
    requests: '',
    ...overrides,
  }
}

function ctxWith(productId = 448405): CheckoutContext {
  return {
    productId,
    title: 'El Yunque',
    meetingType: 'PICK_UP',
    pickupService: true,
    customPickupAllowed: true,
    startPoints: [],
    pricingCategories: [
      { id: 725662, title: 'Adult', ticketCategory: 'ADULT' },
    ],
    pickupPlaces: [],
    bookingQuestions: [],
    requiredCustomerFields: [],
    cancellationPolicy: { title: '24h' },
    content: {},
  } as CheckoutContext
}

// ─── validateSubmitPreflight ──────────────────────────────────────────────

test('preflight: ctx null → ctxMissing (silent guard, no UI error)', () => {
  const r = validateSubmitPreflight({
    ctx: null,
    stripe: {},
    elements: {},
    card: {},
    promoInput: '',
    promoState: 'idle',
  })
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.errorKey, 'ctxMissing')
})

test('preflight: stripe null → paymentLibraryNotReady', () => {
  const r = validateSubmitPreflight({
    ctx: {},
    stripe: null,
    elements: {},
    card: {},
    promoInput: '',
    promoState: 'idle',
  })
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.errorKey, 'paymentLibraryNotReady')
})

test('preflight: elements null → paymentLibraryNotReady', () => {
  const r = validateSubmitPreflight({
    ctx: {},
    stripe: {},
    elements: null,
    card: {},
    promoInput: '',
    promoState: 'idle',
  })
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.errorKey, 'paymentLibraryNotReady')
})

test('preflight: card null → cardNotFound', () => {
  const r = validateSubmitPreflight({
    ctx: {},
    stripe: {},
    elements: {},
    card: null,
    promoInput: '',
    promoState: 'idle',
  })
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.errorKey, 'cardNotFound')
})

test('preflight: promo input non-empty but state !== valid → promoMustValidateBeforePay', () => {
  const r = validateSubmitPreflight({
    ctx: {},
    stripe: {},
    elements: {},
    card: {},
    promoInput: 'SUMMER10',
    promoState: 'checking',
  })
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.errorKey, 'promoMustValidateBeforePay')
})

test('preflight: promo input whitespace-only → still ok (treated as empty)', () => {
  const r = validateSubmitPreflight({
    ctx: {},
    stripe: {},
    elements: {},
    card: {},
    promoInput: '   ',
    promoState: 'idle',
  })
  assert.equal(r.ok, true)
})

test('preflight: all OK → {ok: true}', () => {
  const r = validateSubmitPreflight({
    ctx: {},
    stripe: {},
    elements: {},
    card: {},
    promoInput: 'CODE',
    promoState: 'valid',
  })
  assert.equal(r.ok, true)
})

// ─── buildSubmitBody ──────────────────────────────────────────────────────

test('buildSubmitBody: basic shape — productId, startTimeId, rateId, date, currency', () => {
  const body = buildSubmitBody({
    form: form(),
    qty: { 725662: 2 },
    ctx: ctxWith(),
    startTimeId: 1850341,
    rateId: 918982,
    date: '2026-04-28',
    tokenId: 'tok_visa_test',
    promoState: 'idle',
    promoBreakdown: null,
    needsTitleField: false,
  })
  assert.equal(body.productId, 448405)
  assert.equal(body.startTimeId, 1850341)
  assert.equal(body.rateId, 918982)
  assert.equal(body.date, '2026-04-28')
  assert.equal(body.currency, 'USD')
  assert.deepEqual(body.paymentToken, { token: 'tok_visa_test' })
})

test('buildSubmitBody: passengers expand from qty (1 entry per pax with pricingCategoryId)', () => {
  const body = buildSubmitBody({
    form: form(),
    qty: { 725662: 3 },
    ctx: ctxWith(),
    startTimeId: 1,
    rateId: 1,
    date: '2026-05-01',
    tokenId: 't',
    promoState: 'idle',
    promoBreakdown: null,
    needsTitleField: false,
  })
  assert.equal(body.passengers.length, 3)
  for (const p of body.passengers) {
    assert.equal(p.pricingCategoryId, 725662)
    assert.equal(p.firstName, 'Diag')
    assert.equal(p.lastName, 'CCS')
  }
})

test('buildSubmitBody: no pickup → pickupPlaceId/roomNumber/customPickupAddress undefined', () => {
  const body = buildSubmitBody({
    form: form({ customPickup: false, pickupId: null, roomNumber: '' }),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null, needsTitleField: false,
  })
  assert.equal(body.pickupPlaceId, undefined)
  assert.equal(body.roomNumber, undefined)
  assert.equal(body.customPickupAddress, undefined)
  assert.equal(body.customPickupLat, undefined)
})

test('buildSubmitBody: listed hotel pickup → pickupPlaceId set + roomNumber forwarded', () => {
  const body = buildSubmitBody({
    form: form({
      customPickup: false,
      pickupId: 12345,
      pickupTitle: 'Hilton San Juan',
      roomNumber: '407',
    }),
    qty: { 725662: 2 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null, needsTitleField: false,
  })
  assert.equal(body.pickupPlaceId, 12345)
  assert.equal(body.roomNumber, '407')
  assert.equal(body.customPickupAddress, undefined)
})

test('buildSubmitBody: custom pickup → customPickupAddress + lat/lon set, pickupPlaceId undefined', () => {
  const body = buildSubmitBody({
    form: form({
      customPickup: true,
      pickupId: 99,
      customPickupAddress: '123 Calle Sol, San Juan',
      customPickupLat: 18.46512,
      customPickupLon: -66.10557,
      roomNumber: 'leftover',
    }),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null, needsTitleField: false,
  })
  assert.equal(body.pickupPlaceId, undefined, 'pickupId from listed must NOT leak when customPickup=true')
  assert.equal(body.roomNumber, undefined, 'roomNumber must NOT leak when customPickup=true')
  assert.equal(body.customPickupAddress, '123 Calle Sol, San Juan')
  assert.equal(body.customPickupLat, 18.46512)
  assert.equal(body.customPickupLon, -66.10557)
})

test('buildSubmitBody: promoState="valid" + breakdown → promoCode in body', () => {
  const body = buildSubmitBody({
    form: form(),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't',
    promoState: 'valid',
    promoBreakdown: {
      subtotal: 100, discount: 10, total: 90, currency: 'USD', code: 'SUMMER10',
    },
    needsTitleField: false,
  })
  assert.equal(body.promoCode, 'SUMMER10')
})

test('buildSubmitBody: promoState="invalid" → promoCode absent (anti-regression)', () => {
  const body = buildSubmitBody({
    form: form(),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't',
    promoState: 'invalid',
    promoBreakdown: null,
    needsTitleField: false,
  })
  assert.equal(body.promoCode, undefined)
})

test('buildSubmitBody: needsTitleField=true → mainContactDetails.title="MX"', () => {
  const body = buildSubmitBody({
    form: form(),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null,
    needsTitleField: true,
  })
  assert.equal(body.mainContactDetails.title, 'MX')
})

test('buildSubmitBody: needsTitleField=false → mainContactDetails.title undefined', () => {
  const body = buildSubmitBody({
    form: form(),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null,
    needsTitleField: false,
  })
  assert.equal(body.mainContactDetails.title, undefined)
})

test('buildSubmitBody: empty phone → phone undefined (omitted from body)', () => {
  const body = buildSubmitBody({
    form: form({ phone: '' }),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null, needsTitleField: false,
  })
  assert.equal(body.mainContactDetails.phone, undefined)
})

test('buildSubmitBody: requests + answers passed through', () => {
  const body = buildSubmitBody({
    form: form({ requests: 'Wedding!', answers: { 999: 'Vegan' } }),
    qty: { 725662: 1 },
    ctx: ctxWith(),
    startTimeId: 1, rateId: 1, date: '2026-05-01',
    tokenId: 't', promoState: 'idle', promoBreakdown: null, needsTitleField: false,
  })
  assert.equal(body.specialRequests, 'Wedding!')
  assert.deepEqual(body.answers, { 999: 'Vegan' })
})

// ─── checkPriceMismatch ───────────────────────────────────────────────────

test('checkPriceMismatch: bokunTotal undefined → null', () => {
  const r = checkPriceMismatch({ preview: 100, bokunTotal: undefined })
  assert.equal(r, null)
})

test('checkPriceMismatch: diff > 1 cent → returns mismatch info', () => {
  const r = checkPriceMismatch({ preview: 100, bokunTotal: 99.5, promoCode: 'X' })
  assert.deepEqual(r, { preview: 100, bokun: 99.5, code: 'X' })
})

test('checkPriceMismatch: diff <= 1 cent → null (within float-rounding tolerance)', () => {
  // Math.abs(100 - 99.999) = 0.001 < 0.01 → no mismatch flagged
  assert.equal(checkPriceMismatch({ preview: 100, bokunTotal: 99.999 }), null)
  assert.equal(checkPriceMismatch({ preview: 100, bokunTotal: 100 }), null)
  assert.equal(checkPriceMismatch({ preview: 100, bokunTotal: 100.005 }), null)
})

test('checkPriceMismatch: omits code when promoCode is undefined', () => {
  const r = checkPriceMismatch({ preview: 100, bokunTotal: 90 })
  assert.deepEqual(r, { preview: 100, bokun: 90 })
})
