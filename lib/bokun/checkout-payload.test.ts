import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildBokunOptionsRequest,
  buildBokunPayload,
  buildSubmitLogContext,
  coerceMainContactDetails,
  extractMainContactQuestions,
  extractStripeUti,
  formatCheckoutErrorMessage,
  type CheckoutSubmitRequest,
  type MainContactQuestion,
} from './checkout-payload.ts'

// Minimal fixture — overridden per test. Mirrors what CheckoutPanel.tsx
// posts to /api/bokun/checkout/submit on a successful Stripe tokenization.
function fixture(
  overrides: Partial<CheckoutSubmitRequest> = {},
): CheckoutSubmitRequest {
  return {
    productId: 448405,
    startTimeId: 1850341,
    rateId: 918982,
    date: '2026-04-28',
    passengers: [
      { pricingCategoryId: 725662, firstName: 'Test', lastName: 'Probe' },
      { pricingCategoryId: 725662, firstName: 'Test', lastName: 'Probe' },
    ],
    mainContactDetails: {
      firstName: 'Test',
      lastName: 'Probe',
      email: 'test@example.com',
    },
    paymentToken: { token: 'tok_visa_test' },
    currency: 'USD',
    ...overrides,
  }
}

// ─── Top-level wrapper (CheckoutRequest) ───────────────────────────────────

test('wrapper: source=DIRECT_REQUEST + CUSTOMER_FULL_PAYMENT + CARD', () => {
  const out = buildBokunPayload(fixture())
  assert.equal(out.source, 'DIRECT_REQUEST')
  assert.equal(out.checkoutOption, 'CUSTOMER_FULL_PAYMENT')
  assert.equal(out.paymentMethod, 'CARD')
})

test('wrapper: paymentToken object passes through unchanged', () => {
  const out = buildBokunPayload(
    fixture({ paymentToken: { token: 'tok_unique_xyz' } }),
  )
  assert.deepEqual(out.paymentToken, { token: 'tok_unique_xyz' })
})

test('wrapper: currency defaults to USD when missing', () => {
  const out = buildBokunPayload(fixture({ currency: undefined }))
  assert.equal(out.currency, 'USD')
})

test('wrapper: currency respected when explicit', () => {
  const out = buildBokunPayload(fixture({ currency: 'EUR' }))
  assert.equal(out.currency, 'EUR')
})

test('wrapper: directBooking is the booking container (anti-regression)', () => {
  const out = buildBokunPayload(fixture())
  assert.ok(out.directBooking, 'directBooking must exist')
  assert.ok(
    Array.isArray(out.directBooking.activityBookings),
    'activityBookings MUST live under directBooking, never at root',
  )
  // Anti-regression: prior code put these at root → reproduced
  // Bokun NPE `bookingRequest is null`. Guard against the regression.
  assert.equal(
    (out as Record<string, unknown>).activityBookings,
    undefined,
    'no root-level activityBookings (legacy bug)',
  )
  assert.equal(
    (out as Record<string, unknown>).customer,
    undefined,
    'no root-level customer (legacy bug — must be mainContactDetails AnswerDto[])',
  )
  assert.equal(
    (out as Record<string, unknown>).bookingQuestionAnswers,
    undefined,
    'no root-level bookingQuestionAnswers (legacy bug)',
  )
  assert.equal(
    (out as Record<string, unknown>).customerComment,
    undefined,
    'no root-level customerComment (legacy bug)',
  )
})

// ─── mainContactDetails — AnswerDto[] shape ────────────────────────────────

test('mainContactDetails: emits firstName/lastName/email always', () => {
  const out = buildBokunPayload(fixture())
  const ids = out.directBooking.mainContactDetails.map(a => a.questionId)
  assert.ok(ids.includes('firstName'))
  assert.ok(ids.includes('lastName'))
  assert.ok(ids.includes('email'))
})

test('mainContactDetails: each entry has questionId + values:string[]', () => {
  const out = buildBokunPayload(fixture())
  for (const a of out.directBooking.mainContactDetails) {
    assert.equal(typeof a.questionId, 'string')
    assert.ok(Array.isArray(a.values))
    assert.equal(a.values.length, 1)
  }
})

test('mainContactDetails: title omitted when not provided', () => {
  const out = buildBokunPayload(fixture())
  const ids = out.directBooking.mainContactDetails.map(a => a.questionId)
  assert.ok(!ids.includes('title'), 'title must not appear when undefined')
})

test('mainContactDetails: title included when provided (e.g. MX)', () => {
  const out = buildBokunPayload(
    fixture({
      mainContactDetails: {
        title: 'MX',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
      },
    }),
  )
  const title = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'title',
  )
  assert.deepEqual(title?.values, ['MX'])
})

test('mainContactDetails: phoneNumber included when provided', () => {
  const out = buildBokunPayload(
    fixture({
      mainContactDetails: {
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
        phone: '+19295551234',
      },
    }),
  )
  const phone = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'phoneNumber',
  )
  assert.deepEqual(phone?.values, ['+19295551234'])
})

test('mainContactDetails: phoneNumber omitted when blank', () => {
  const out = buildBokunPayload(fixture())
  const ids = out.directBooking.mainContactDetails.map(a => a.questionId)
  assert.ok(!ids.includes('phoneNumber'))
})

// ─── activityBookings[0] structure ─────────────────────────────────────────

test('activityBooking: carries activityId/startTimeId/rateId/date', () => {
  const out = buildBokunPayload(fixture())
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.activityId, 448405)
  assert.equal(ab.startTimeId, 1850341)
  assert.equal(ab.rateId, 918982)
  assert.equal(ab.date, '2026-04-28')
})

test('activityBooking: passengers carry ONLY pricingCategoryId (no passengerDetails)', () => {
  const out = buildBokunPayload(fixture())
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.passengers.length, 2)
  for (const p of ab.passengers) {
    assert.equal(typeof p.pricingCategoryId, 'number')
    // Anti-regression: legacy code shipped passengerDetails:[{field,value}]
    // which is not a field of ActivityBookingRequest in the spec.
    assert.equal(
      (p as Record<string, unknown>).passengerDetails,
      undefined,
      'no passengerDetails on Passenger (legacy bug)',
    )
  }
})

// ─── pickup variants ───────────────────────────────────────────────────────

test('pickup: listed hotel with roomNumber → pickup:true + Place id + Room desc', () => {
  const out = buildBokunPayload(
    fixture({
      pickupPlaceId: 12345,
      roomNumber: '407',
    }),
  )
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.pickup, true)
  assert.equal(ab.pickupPlaceId, 12345)
  assert.deepEqual(ab.pickupAnswers, [
    { questionId: 'pickupPlaceDescription', values: ['Room 407'] },
  ])
})

test('pickup: listed hotel without roomNumber → fallback "Hotel pickup"', () => {
  const out = buildBokunPayload(fixture({ pickupPlaceId: 12345 }))
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.pickup, true)
  assert.equal(ab.pickupPlaceId, 12345)
  assert.deepEqual(ab.pickupAnswers, [
    { questionId: 'pickupPlaceDescription', values: ['Hotel pickup'] },
  ])
})

test('pickup: custom address with coords → no placeId, address+coords in description', () => {
  const out = buildBokunPayload(
    fixture({
      customPickupAddress: '123 Calle Sol, San Juan',
      customPickupLat: 18.46512,
      customPickupLon: -66.10557,
    }),
  )
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.pickup, true)
  assert.equal(ab.pickupPlaceId, undefined, 'no placeId for custom address')
  assert.equal(ab.pickupAnswers?.length, 1)
  const desc = ab.pickupAnswers?.[0]?.values?.[0] ?? ''
  assert.match(desc, /123 Calle Sol/)
  assert.match(desc, /18\.46512/)
  assert.match(desc, /-66\.10557/)
})

test('pickup: custom address without coords → just address', () => {
  const out = buildBokunPayload(
    fixture({ customPickupAddress: 'San Juan downtown' }),
  )
  const ab = out.directBooking.activityBookings[0]
  assert.deepEqual(ab.pickupAnswers, [
    { questionId: 'pickupPlaceDescription', values: ['San Juan downtown'] },
  ])
})

test('no pickup: emits neither pickup keys nor pickupAnswers', () => {
  const out = buildBokunPayload(fixture())
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.pickup, undefined)
  assert.equal(ab.pickupPlaceId, undefined)
  assert.equal(ab.pickupAnswers, undefined)
})

// ─── activity questions answers ────────────────────────────────────────────

test('answers: Record<id,string> → activityBookings[0].answers AnswerDto[]', () => {
  const out = buildBokunPayload(
    fixture({
      answers: { 999: 'Vegetarian', 1001: 'Birthday' },
    }),
  )
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.answers?.length, 2)
  const ids = ab.answers?.map(a => a.questionId).sort()
  assert.deepEqual(ids, ['1001', '999'])
})

test('answers: empty/undefined values are filtered out', () => {
  const out = buildBokunPayload(
    fixture({
      answers: { 999: '', 1001: 'Real value' } as Record<number, string>,
    }),
  )
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.answers?.length, 1)
  assert.equal(ab.answers?.[0].questionId, '1001')
})

test('answers: omitted entirely when empty input', () => {
  const out = buildBokunPayload(fixture())
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.answers, undefined)
})

// ─── specialRequests → note ────────────────────────────────────────────────

test('specialRequests: maps to activityBooking.note', () => {
  const out = buildBokunPayload(
    fixture({ specialRequests: 'Wedding anniversary, please celebrate!' }),
  )
  const ab = out.directBooking.activityBookings[0]
  assert.equal(ab.note, 'Wedding anniversary, please celebrate!')
})

test('specialRequests: omitted when empty', () => {
  const out = buildBokunPayload(fixture())
  assert.equal(out.directBooking.activityBookings[0].note, undefined)
})

// ─── promoCode ─────────────────────────────────────────────────────────────

test('promoCode: lives in directBooking.promoCode (NOT root)', () => {
  const out = buildBokunPayload(fixture({ promoCode: 'SUMMER10' }))
  assert.equal(out.directBooking.promoCode, 'SUMMER10')
  assert.equal(
    (out as Record<string, unknown>).promoCode,
    undefined,
    'must not leak to root (anti-regression)',
  )
})

test('promoCode: trimmed', () => {
  const out = buildBokunPayload(fixture({ promoCode: '  SUMMER10  ' }))
  assert.equal(out.directBooking.promoCode, 'SUMMER10')
})

test('promoCode: omitted when blank/whitespace', () => {
  const a = buildBokunPayload(fixture({ promoCode: '' }))
  const b = buildBokunPayload(fixture({ promoCode: '   ' }))
  assert.equal(a.directBooking.promoCode, undefined)
  assert.equal(b.directBooking.promoCode, undefined)
})

// ─── uti propagation ───────────────────────────────────────────────────────

test('uti: omitted when not provided', () => {
  const out = buildBokunPayload(fixture())
  assert.equal(out.uti, undefined)
})

test('uti: included at root when provided', () => {
  const out = buildBokunPayload(fixture(), 'b9fa3369-6326-4b9e-a6cf-acbbdf4cd898')
  assert.equal(out.uti, 'b9fa3369-6326-4b9e-a6cf-acbbdf4cd898')
})

// ─── buildBokunOptionsRequest (BookingRequest body for /options) ───────────

test('options request: shape matches directBooking sub-object', () => {
  const input = fixture({
    pickupPlaceId: 12345,
    roomNumber: '407',
    answers: { 999: 'X' },
    promoCode: 'CODE',
    specialRequests: 'note',
  })
  // The /options endpoint expects exactly the BookingRequest portion —
  // no payment fields, no top-level wrapper. By construction it matches
  // the directBooking sub-object of the submit payload.
  const opts = buildBokunOptionsRequest(input)
  const submit = buildBokunPayload(input, 'uti-x')
  assert.deepEqual(opts, submit.directBooking)
})

test('options request: contains mainContactDetails AnswerDto[] + activityBookings[]', () => {
  const opts = buildBokunOptionsRequest(fixture())
  assert.ok(Array.isArray(opts.mainContactDetails))
  assert.ok(Array.isArray(opts.activityBookings))
  assert.equal(opts.activityBookings.length, 1)
})

// ─── extractStripeUti (defensive parser) ───────────────────────────────────

test('extractStripeUti: finds uti from Stripe TOKEN provider', () => {
  const resp = {
    options: [
      {
        type: 'CUSTOMER_FULL_PAYMENT',
        paymentMethods: {
          paymentProviders: [
            {
              title: 'Stripe',
              providerId: 'STRIPE_TOKEN',
              providerType: 'TOKEN',
              uti: 'b9fa3369-6326-4b9e-a6cf-acbbdf4cd898',
            },
          ],
        },
      },
    ],
  }
  assert.equal(extractStripeUti(resp), 'b9fa3369-6326-4b9e-a6cf-acbbdf4cd898')
})

test('extractStripeUti: returns null for empty/invalid input', () => {
  assert.equal(extractStripeUti(null), null)
  assert.equal(extractStripeUti(undefined), null)
  assert.equal(extractStripeUti({}), null)
  assert.equal(extractStripeUti({ options: [] }), null)
  assert.equal(extractStripeUti({ options: 'not-an-array' }), null)
})

test('extractStripeUti: returns null when no Stripe provider present', () => {
  const resp = {
    options: [
      {
        type: 'CUSTOMER_FULL_PAYMENT',
        paymentMethods: {
          paymentProviders: [
            { providerId: 'PAYPAL', providerType: 'REDIRECT', uti: 'pp-1' },
          ],
        },
      },
    ],
  }
  assert.equal(extractStripeUti(resp), null)
})

test('extractStripeUti: skips Stripe entries with empty uti', () => {
  const resp = {
    options: [
      {
        paymentMethods: {
          paymentProviders: [
            { providerId: 'STRIPE_TOKEN', providerType: 'TOKEN', uti: '' },
          ],
        },
      },
    ],
  }
  assert.equal(extractStripeUti(resp), null)
})

// ─── extractMainContactQuestions ───────────────────────────────────────────

test('extractMainContactQuestions: parses Bokun /options response', () => {
  const resp = {
    questions: {
      mainContactDetails: [
        {
          questionId: 'title',
          required: true,
          selectFromOptions: true,
          answerOptions: [
            { value: 'MR', label: 'Mr' },
            { value: 'MRS', label: 'Mrs' },
            { value: 'MISS', label: 'Miss' },
          ],
        },
        {
          questionId: 'firstName',
          required: true,
          selectFromOptions: false,
          answerOptions: [],
        },
      ],
    },
  }
  const qs = extractMainContactQuestions(resp)
  assert.equal(qs.length, 2)
  const title = qs.find(q => q.questionId === 'title')
  assert.deepEqual(title?.answerOptions, ['MR', 'MRS', 'MISS'])
  assert.equal(title?.required, true)
  assert.equal(title?.selectFromOptions, true)
})

test('extractMainContactQuestions: empty/invalid input → []', () => {
  assert.deepEqual(extractMainContactQuestions(null), [])
  assert.deepEqual(extractMainContactQuestions({}), [])
  assert.deepEqual(extractMainContactQuestions({ questions: {} }), [])
  assert.deepEqual(
    extractMainContactQuestions({ questions: { mainContactDetails: 'no' } }),
    [],
  )
})

// ─── coerceMainContactDetails (the actual title='MX' fix) ──────────────────

const TITLE_QUESTIONS: MainContactQuestion[] = [
  {
    questionId: 'title',
    required: true,
    selectFromOptions: true,
    answerOptions: ['MR', 'MRS', 'MISS'],
  },
  {
    questionId: 'firstName',
    required: true,
    selectFromOptions: false,
    answerOptions: [],
  },
]

test('coerce: client title="MX" gets replaced with first valid option (MR)', () => {
  const initial = buildBokunPayload(
    fixture({
      mainContactDetails: {
        title: 'MX',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
      },
    }),
    'uti-x',
  )
  const out = coerceMainContactDetails(initial, TITLE_QUESTIONS)
  const title = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'title',
  )
  assert.deepEqual(title?.values, ['MR'])
})

test('coerce: client title="MR" (already valid) stays unchanged', () => {
  const initial = buildBokunPayload(
    fixture({
      mainContactDetails: {
        title: 'MR',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
      },
    }),
    'uti-x',
  )
  const out = coerceMainContactDetails(initial, TITLE_QUESTIONS)
  const title = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'title',
  )
  assert.deepEqual(title?.values, ['MR'])
})

test('coerce: missing required select-from-options answer is added', () => {
  const initial = buildBokunPayload(fixture(), 'uti-x') // no title
  const out = coerceMainContactDetails(initial, TITLE_QUESTIONS)
  const title = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'title',
  )
  assert.deepEqual(title?.values, ['MR'])
})

test('coerce: free-text answers (firstName, email) are passed through', () => {
  const initial = buildBokunPayload(
    fixture({
      mainContactDetails: {
        firstName: 'CustomName',
        lastName: 'Lastname',
        email: 'x@y.z',
      },
    }),
    'uti-x',
  )
  const out = coerceMainContactDetails(initial, TITLE_QUESTIONS)
  const fn = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'firstName',
  )
  assert.deepEqual(fn?.values, ['CustomName'])
})

test('coerce: empty questions list → payload unchanged (passthrough)', () => {
  const initial = buildBokunPayload(
    fixture({
      mainContactDetails: {
        title: 'MX',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
      },
    }),
    'uti-x',
  )
  const out = coerceMainContactDetails(initial, [])
  assert.deepEqual(out, initial, 'no questions → no changes')
})

test('coerce: optional missing select-from-options answers are NOT added', () => {
  const optional: MainContactQuestion[] = [
    {
      questionId: 'gender',
      required: false,
      selectFromOptions: true,
      answerOptions: ['M', 'F', 'X'],
    },
  ]
  const initial = buildBokunPayload(fixture(), 'uti-x') // no gender
  const out = coerceMainContactDetails(initial, optional)
  const gender = out.directBooking.mainContactDetails.find(
    a => a.questionId === 'gender',
  )
  assert.equal(gender, undefined)
})

test('coerce: returns a NEW payload (no mutation)', () => {
  const initial = buildBokunPayload(
    fixture({
      mainContactDetails: {
        title: 'MX',
        firstName: 'A',
        lastName: 'B',
        email: 'a@b.c',
      },
    }),
    'uti-x',
  )
  const before = JSON.stringify(initial)
  coerceMainContactDetails(initial, TITLE_QUESTIONS)
  assert.equal(JSON.stringify(initial), before, 'input must not be mutated')
})

// ─── formatCheckoutErrorMessage (UI error surfacing) ───────────────────────

test('formatError: null/undefined detail → base unchanged', () => {
  assert.equal(
    formatCheckoutErrorMessage('Bokun upstream error', null),
    'Bokun upstream error',
  )
  assert.equal(
    formatCheckoutErrorMessage('Bokun upstream error', undefined),
    'Bokun upstream error',
  )
})

test('formatError: detail string → appended', () => {
  assert.equal(
    formatCheckoutErrorMessage('Bokun upstream error', 'Card declined'),
    'Bokun upstream error — Card declined',
  )
})

test('formatError: detail.message → appended', () => {
  assert.equal(
    formatCheckoutErrorMessage('Bokun upstream error', { message: 'Invalid token id: tok_x' }),
    'Bokun upstream error — Invalid token id: tok_x',
  )
})

test('formatError: strips "Error occurred:" prefix + Java FQN', () => {
  // Real shape returned by Bokun (verified live against api.bokun.is)
  const detail = {
    message: 'Error occurred: msclients.payments.PaymentException - Invalid token id: tok_x',
  }
  assert.equal(
    formatCheckoutErrorMessage('Bokun upstream error', detail),
    'Bokun upstream error — Invalid token id: tok_x',
  )
})

test('formatError: handles InvalidAnswersException pattern', () => {
  const detail = {
    message:
      'Error occurred: is.bokun.dtos.questions.validation.InvalidAnswersException - Invalid or missing answers',
  }
  assert.equal(
    formatCheckoutErrorMessage('Bokun upstream error', detail),
    'Bokun upstream error — Invalid or missing answers',
  )
})

test('formatError: detail.error fallback (alt server shape)', () => {
  assert.equal(
    formatCheckoutErrorMessage('Server error', { error: 'rate limited' }),
    'Server error — rate limited',
  )
})

test('formatError: empty/non-string detail fields → base unchanged', () => {
  assert.equal(formatCheckoutErrorMessage('base', { message: '' }), 'base')
  assert.equal(formatCheckoutErrorMessage('base', { message: '   ' }), 'base')
  assert.equal(formatCheckoutErrorMessage('base', { message: 42 }), 'base')
  assert.equal(formatCheckoutErrorMessage('base', { foo: 'bar' }), 'base')
})

test('formatError: arrays and primitives are ignored (defensive)', () => {
  assert.equal(formatCheckoutErrorMessage('base', []), 'base')
  assert.equal(formatCheckoutErrorMessage('base', 42), 'base')
  assert.equal(formatCheckoutErrorMessage('base', true), 'base')
})

// ─── Determinism ───────────────────────────────────────────────────────────

test('pure function: same input → identical output', () => {
  const input = fixture({
    pickupPlaceId: 12345,
    roomNumber: '407',
    answers: { 999: 'X' },
    promoCode: 'CODE',
    specialRequests: 'note',
  })
  assert.deepEqual(buildBokunPayload(input), buildBokunPayload(input))
  assert.deepEqual(buildBokunPayload(input, 'u'), buildBokunPayload(input, 'u'))
  assert.deepEqual(
    buildBokunOptionsRequest(input),
    buildBokunOptionsRequest(input),
  )
})

// ─── buildSubmitLogContext — Fix 5 (debug observability) ───────────────────

test('buildSubmitLogContext: extracts identification fields from payload', () => {
  const payload = fixture()
  const bokun = buildBokunPayload(payload, 'uti-test-123')
  const ctx = buildSubmitLogContext(
    payload,
    bokun,
    { status: 400, detail: { message: 'x' } },
    { optionsMs: 250, submitMs: 800 },
  )
  assert.equal(ctx.productId, 448405)
  assert.equal(ctx.startTimeId, 1850341)
  assert.equal(ctx.rateId, 918982)
  assert.equal(ctx.date, '2026-04-28')
  assert.equal(ctx.paxCount, 2)
})

test('buildSubmitLogContext: lists mainContact questionIds (not values, no PII)', () => {
  const payload = fixture({
    mainContactDetails: {
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@private.example',
      phone: '+15555550101',
    },
  })
  const bokun = buildBokunPayload(payload, 'uti')
  const ctx = buildSubmitLogContext(
    payload,
    bokun,
    { status: 400, detail: null },
    { optionsMs: 0, submitMs: 0 },
  )
  assert.deepEqual(
    [...ctx.mainContactQuestionIds].sort(),
    ['email', 'firstName', 'lastName', 'phoneNumber'],
  )
  // PII anti-leak: no contact value should ever land in the log object
  const serialized = JSON.stringify(ctx)
  assert.ok(!serialized.includes('alice@private.example'), 'no email value')
  assert.ok(!serialized.includes('Alice'), 'no first name value')
  assert.ok(!serialized.includes('Smith'), 'no last name value')
  assert.ok(!serialized.includes('+15555550101'), 'no phone value')
})

test('buildSubmitLogContext: answersKeys empty when answers undefined', () => {
  const payload = fixture()
  const bokun = buildBokunPayload(payload, 'uti')
  const ctx = buildSubmitLogContext(
    payload,
    bokun,
    { status: 400, detail: null },
    { optionsMs: 0, submitMs: 0 },
  )
  assert.deepEqual(ctx.answersKeys, [])
})

test('buildSubmitLogContext: answersKeys lists ids only (not values)', () => {
  const payload = fixture({
    answers: { '12345': 'reponse confidentielle A', '67890': 'autre B' },
  })
  const bokun = buildBokunPayload(payload, 'uti')
  const ctx = buildSubmitLogContext(
    payload,
    bokun,
    { status: 400, detail: null },
    { optionsMs: 0, submitMs: 0 },
  )
  assert.deepEqual([...ctx.answersKeys].sort(), ['12345', '67890'])
  const serialized = JSON.stringify(ctx)
  assert.ok(!serialized.includes('reponse confidentielle A'), 'no answer value')
  assert.ok(!serialized.includes('autre B'), 'no answer value')
})

test('buildSubmitLogContext: hasUti reflects bokunRequest.uti presence', () => {
  const payload = fixture()
  const withUti = buildBokunPayload(payload, 'uti-xyz')
  const noUti = buildBokunPayload(payload)
  const ctxWith = buildSubmitLogContext(
    payload,
    withUti,
    { status: 400, detail: null },
    { optionsMs: 0, submitMs: 0 },
  )
  const ctxWithout = buildSubmitLogContext(
    payload,
    noUti,
    { status: 400, detail: null },
    { optionsMs: 0, submitMs: 0 },
  )
  assert.equal(ctxWith.hasUti, true)
  assert.equal(ctxWithout.hasUti, false)
})

test('buildSubmitLogContext: timing + upstream forwarded verbatim', () => {
  const payload = fixture()
  const bokun = buildBokunPayload(payload, 'uti')
  const detail = { message: 'Invalid answers', path: '/mainContactDetails/3' }
  const ctx = buildSubmitLogContext(
    payload,
    bokun,
    { status: 400, detail },
    { optionsMs: 1234, submitMs: 5678 },
  )
  assert.equal(ctx.optionsMs, 1234)
  assert.equal(ctx.submitMs, 5678)
  assert.equal(ctx.upstreamStatus, 400)
  assert.deepEqual(ctx.detail, detail)
})

test('buildSubmitLogContext: paymentToken never appears in log', () => {
  const payload = fixture({ paymentToken: { token: 'tok_secret_xyz_42' } })
  const bokun = buildBokunPayload(payload, 'uti')
  const ctx = buildSubmitLogContext(
    payload,
    bokun,
    { status: 400, detail: null },
    { optionsMs: 0, submitMs: 0 },
  )
  const serialized = JSON.stringify(ctx)
  assert.ok(
    !serialized.includes('tok_secret_xyz_42'),
    'payment token must never be logged',
  )
})
