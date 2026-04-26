// Spec-compliant payload builder for POST /checkout.json/submit (Bokun REST API).
//
// Source of truth : https://api-docs.bokun.dev/rest-v1.yaml
//   • CheckoutRequest schema requires `source` discriminator
//     (DIRECT_REQUEST vs SHOPPING_CART). We use DIRECT_REQUEST — the
//     booking data lives inside `directBooking: BookingRequest`,
//     never at the root.
//   • `mainContactDetails` is `AnswerDto[]`, NOT a typed Customer
//     object. Each answer carries `questionId` (e.g. 'firstName',
//     'email') and `values: string[]`.
//   • ActivityBookingRequest has `pickupAnswers: AnswerDto[]` for
//     pickup metadata, `note: string` for free-form requests, and
//     `answers: AnswerDto[]` for booking questions.
//
// The previous version of this module (inlined in the submit route)
// flattened everything at root level, which caused Bokun to NPE with
// `bookingRequest is null` for every live submission — the parser
// could not find `directBooking` (the Java-internal name surfaced as
// `bookingRequest` in the error). Reproduced and confirmed against
// api.bokun.is during the audit phase.

export type PassengerSubmit = {
  pricingCategoryId: number
  firstName?: string
  lastName?: string
}

export type CheckoutSubmitRequest = {
  productId: number
  startTimeId: number
  rateId: number
  /** yyyy-MM-dd */
  date: string
  passengers: PassengerSubmit[]
  /** Either a listed Bókun pickup place id OR a custom free-text address. */
  pickupPlaceId?: number
  roomNumber?: string
  customPickupAddress?: string
  customPickupLat?: number
  customPickupLon?: number
  mainContactDetails: {
    title?: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
  /** Map of Bókun bookingQuestion id → answer. */
  answers?: Record<number | string, string>
  specialRequests?: string
  /** Stripe token obtained client-side via Stripe.js createToken(). */
  paymentToken: { token: string }
  currency?: string
  promoCode?: string
}

export type AnswerDto = {
  questionId: string
  values: string[]
}

export type BokunActivityBookingRequest = {
  activityId: number
  startTimeId: number
  rateId: number
  date: string
  passengers: {
    pricingCategoryId: number
    passengerDetails: AnswerDto[]
  }[]
  pickup?: boolean
  pickupPlaceId?: number
  pickupAnswers?: AnswerDto[]
  answers?: AnswerDto[]
  note?: string
}

export type BokunDirectBooking = {
  mainContactDetails: AnswerDto[]
  activityBookings: BokunActivityBookingRequest[]
  promoCode?: string
}

export type BokunCheckoutRequest = {
  checkoutOption: 'CUSTOMER_FULL_PAYMENT'
  paymentMethod: 'CARD'
  source: 'DIRECT_REQUEST'
  currency: string
  /** Unique transaction identifier — obtained from a prior call to
   *  POST /checkout.json/options/booking-request. Bokun rejects /submit
   *  without it (logic.InvalidDataException). */
  uti?: string
  paymentToken: { token: string }
  directBooking: BokunDirectBooking
}

/**
 * Normalises a phone string to E.164 (no spaces, single leading `+`).
 * Bokun rejects "+1 929 555 1234" with `InvalidAnswersException - Not a
 * valid phone number` (verified live, 2026-04-26 logs). E.164 = `+`
 * followed by digits only, country code first.
 */
export function normalizePhoneE164(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('+')) return '+' + cleaned.slice(1).replace(/\+/g, '')
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2)
  if (cleaned.length === 10) return '+1' + cleaned
  if (cleaned.length === 11 && cleaned.startsWith('1')) return '+' + cleaned
  return '+' + cleaned
}

function buildMainContactDetails(
  c: CheckoutSubmitRequest['mainContactDetails'],
): AnswerDto[] {
  // Always send firstName/lastName/email (required in input). Send
  // title and phoneNumber only when populated. Phone is normalised to
  // E.164 because Bokun rejects formatted strings with spaces/parens.
  const out: AnswerDto[] = []
  if (c.title) out.push({ questionId: 'title', values: [c.title] })
  out.push({ questionId: 'firstName', values: [c.firstName] })
  out.push({ questionId: 'lastName', values: [c.lastName] })
  out.push({ questionId: 'email', values: [c.email] })
  if (c.phone) {
    const normalized = normalizePhoneE164(c.phone)
    if (normalized) out.push({ questionId: 'phoneNumber', values: [normalized] })
  }
  return out
}

/**
 * Builds passengerDetails for a single passenger. Bokun /submit rejects
 * with `MISSING /activityBookings/N/passengers/M/passengerDetails/{0,1}`
 * when this is absent (verified live, 2026-04-26 logs — 9-pax Catamaran).
 *
 * MVP fallback: lead booker (main contact) name is used for every passenger
 * the UI did not collect a per-pax name for. Acceptable trade-off until
 * the form gets per-passenger name fields.
 */
function buildPassengerDetails(
  p: PassengerSubmit,
  contact: CheckoutSubmitRequest['mainContactDetails'],
): AnswerDto[] {
  const firstName = p.firstName?.trim() || contact.firstName
  const lastName = p.lastName?.trim() || contact.lastName
  return [
    { questionId: 'firstName', values: [firstName] },
    { questionId: 'lastName', values: [lastName] },
  ]
}

function buildPickupAnswers(b: CheckoutSubmitRequest): AnswerDto[] {
  // Bokun requires `pickupPlaceDescription` whenever pickup=true on an
  // activity that defines pickup questions (verified live: El Yunque
  // returns InvalidAnswersException with path
  // `/activityBookings/0/pickupQuestions/0`). We synthesize a
  // non-empty description from the data we have.
  if (b.customPickupAddress) {
    const coord =
      b.customPickupLat !== undefined && b.customPickupLon !== undefined
        ? ` (${b.customPickupLat.toFixed(5)}, ${b.customPickupLon.toFixed(5)})`
        : ''
    return [
      {
        questionId: 'pickupPlaceDescription',
        values: [`${b.customPickupAddress}${coord}`],
      },
    ]
  }
  if (b.pickupPlaceId) {
    const desc = b.roomNumber ? `Room ${b.roomNumber}` : 'Hotel pickup'
    return [{ questionId: 'pickupPlaceDescription', values: [desc] }]
  }
  return []
}

function buildActivityAnswers(
  raw: CheckoutSubmitRequest['answers'],
): AnswerDto[] {
  if (!raw) return []
  return Object.entries(raw)
    .filter(([, v]) => typeof v === 'string' && v.length > 0)
    .map(([qid, v]) => ({ questionId: String(qid), values: [v] }))
}

function buildActivityBooking(
  b: CheckoutSubmitRequest,
): BokunActivityBookingRequest {
  const passengers = b.passengers.map(p => ({
    pricingCategoryId: p.pricingCategoryId,
    passengerDetails: buildPassengerDetails(p, b.mainContactDetails),
  }))
  const pickupAnswers = buildPickupAnswers(b)
  const activityAnswers = buildActivityAnswers(b.answers)
  const usePickup = Boolean(b.pickupPlaceId || b.customPickupAddress)
  return {
    activityId: b.productId,
    startTimeId: b.startTimeId,
    rateId: b.rateId,
    date: b.date,
    passengers,
    ...(usePickup ? { pickup: true } : {}),
    ...(b.pickupPlaceId ? { pickupPlaceId: b.pickupPlaceId } : {}),
    ...(pickupAnswers.length ? { pickupAnswers } : {}),
    ...(activityAnswers.length ? { answers: activityAnswers } : {}),
    ...(b.specialRequests ? { note: b.specialRequests } : {}),
  }
}

/**
 * Builds the BookingRequest body for POST /checkout.json/options/booking-request,
 * which Bokun requires before /submit (it returns the `uti` we must echo back
 * in the submit payload — verified live: without uti, Bokun answers
 * `logic.InvalidDataException - You must provide the uti …`).
 *
 * The body shape is the SAME `directBooking` object we use in the submit
 * payload — extracted here so route.ts can call options without duplicating
 * the construction logic.
 */
export function buildBokunOptionsRequest(
  b: CheckoutSubmitRequest,
): BokunDirectBooking {
  const trimmedPromo = b.promoCode?.trim()
  return {
    mainContactDetails: buildMainContactDetails(b.mainContactDetails),
    activityBookings: [buildActivityBooking(b)],
    ...(trimmedPromo ? { promoCode: trimmedPromo } : {}),
  }
}

/**
 * Extracts the Stripe-provider `uti` from a /checkout.json/options response.
 * Defensive: returns null if the structure is unexpected so the caller can
 * surface a clean error instead of crashing on a vendor format change.
 *
 * Path traversed:
 *   options[].paymentMethods.paymentProviders[].uti
 *   matched on (providerType=TOKEN OR providerId=STRIPE_TOKEN).
 */
export type MainContactQuestion = {
  questionId: string
  required: boolean
  selectFromOptions: boolean
  /** Valid `value`s when selectFromOptions is true. */
  answerOptions: string[]
}

/**
 * Extracts the main-contact question specs from a /checkout.json/options
 * response. Used to coerce client-supplied answers (e.g. `title='MX'` from
 * the inclusivity-default in CheckoutPanel.tsx:367) into one of Bokun's
 * accepted enum values for the activity. Returns [] on shape mismatch.
 */
export function extractMainContactQuestions(
  raw: unknown,
): MainContactQuestion[] {
  if (!raw || typeof raw !== 'object') return []
  const r = raw as { questions?: { mainContactDetails?: unknown } }
  const list = r.questions?.mainContactDetails
  if (!Array.isArray(list)) return []
  const out: MainContactQuestion[] = []
  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const q = item as Record<string, unknown>
    const qid = typeof q.questionId === 'string' ? q.questionId : ''
    if (!qid) continue
    const rawOpts = Array.isArray(q.answerOptions) ? q.answerOptions : []
    const answerOptions: string[] = []
    for (const o of rawOpts) {
      if (!o || typeof o !== 'object') continue
      const v = (o as { value?: unknown }).value
      if (typeof v === 'string' && v.length > 0) answerOptions.push(v)
    }
    out.push({
      questionId: qid,
      required: q.required === true,
      selectFromOptions: q.selectFromOptions === true,
      answerOptions,
    })
  }
  return out
}

/**
 * Coerces a CheckoutRequest's mainContactDetails so every select-from-options
 * answer carries a value Bokun accepts. Three rules:
 *   1. If client sent a value NOT in answerOptions → replace with the first
 *      valid option (UI cannot evolve fast enough; server adapts).
 *   2. If a select-from-options question is required AND the client sent
 *      nothing → add the first valid option.
 *   3. Free-text questions (selectFromOptions=false) are passed through.
 *
 * Pure function — returns a new payload, doesn't mutate.
 */
export function coerceMainContactDetails(
  payload: BokunCheckoutRequest,
  questions: MainContactQuestion[],
): BokunCheckoutRequest {
  if (questions.length === 0) return payload
  const byId = new Map(questions.map(q => [q.questionId, q]))
  const seen = new Set<string>()
  const coerced: AnswerDto[] = []
  for (const a of payload.directBooking.mainContactDetails) {
    seen.add(a.questionId)
    const q = byId.get(a.questionId)
    if (!q || !q.selectFromOptions || q.answerOptions.length === 0) {
      coerced.push(a)
      continue
    }
    const valid = new Set(q.answerOptions)
    const allValid = a.values.length > 0 && a.values.every(v => valid.has(v))
    coerced.push(
      allValid
        ? a
        : { questionId: a.questionId, values: [q.answerOptions[0]] },
    )
  }
  // Add required select-from-options answers that the client omitted.
  for (const q of questions) {
    if (seen.has(q.questionId)) continue
    if (!q.required || !q.selectFromOptions || q.answerOptions.length === 0) {
      continue
    }
    coerced.push({ questionId: q.questionId, values: [q.answerOptions[0]] })
  }
  return {
    ...payload,
    directBooking: {
      ...payload.directBooking,
      mainContactDetails: coerced,
    },
  }
}

/**
 * Formats an end-user error message from a non-OK /api/bokun/checkout/submit
 * response. Surfaces `detail.message` (the actual Bokun/Stripe reason)
 * appended to the base error string so users see WHY the booking failed
 * instead of the generic "Bokun upstream error".
 *
 * Strips the noisy Java prefix Bokun returns:
 *   "Error occurred: foo.bar.SomethingException - real reason"
 *   → "real reason"
 *
 * Returns `base` unchanged when detail is empty/unparsable.
 */
export function formatCheckoutErrorMessage(
  base: string,
  detail: unknown,
): string {
  const raw = readDetailMessage(detail)
  if (!raw) return base
  return `${base} — ${stripJavaNoise(raw)}`
}

function readDetailMessage(detail: unknown): string | null {
  if (!detail) return null
  if (typeof detail === 'string') return detail.trim() || null
  if (Array.isArray(detail)) return null
  if (typeof detail !== 'object') return null
  const d = detail as { message?: unknown; error?: unknown }
  if (typeof d.message === 'string' && d.message.trim()) return d.message
  if (typeof d.error === 'string' && d.error.trim()) return d.error
  return null
}

function stripJavaNoise(msg: string): string {
  let m = msg.trim()
  // "Error occurred: " prefix
  m = m.replace(/^Error occurred:\s*/i, '')
  // Java FQN before " - " (e.g. "msclients.payments.PaymentException - ")
  m = m.replace(/^[a-z][\w$]*(?:\.[\w$]+)*\.[A-Z]\w*(?:Exception|Error)\s+-\s+/, '')
  return m.trim()
}

// Structured context for /api/bokun/checkout/submit failure logs. Lets
// us disambiguate causes of "Invalid or missing answers" — HYP-A
// (free-text required missing on mainContact), HYP-B (activity answer
// dropped before submit), HYP-C (uti TTL expired between options/submit) —
// without leaking PII. Excluded by design: mainContactDetails values
// (email, name, phone), paymentToken.token, full mainContact answers —
// only the questionIds shipped are logged.
export type SubmitLogContext = {
  productId: number
  startTimeId: number
  rateId: number
  date: string
  paxCount: number
  answersKeys: string[]
  mainContactQuestionIds: string[]
  hasUti: boolean
  optionsMs: number
  submitMs: number
  upstreamStatus: number
  detail: unknown
}

export function buildSubmitLogContext(
  payload: CheckoutSubmitRequest,
  bokunRequest: BokunCheckoutRequest,
  upstream: { status: number; detail: unknown },
  timing: { optionsMs: number; submitMs: number },
): SubmitLogContext {
  return {
    productId: payload.productId,
    startTimeId: payload.startTimeId,
    rateId: payload.rateId,
    date: payload.date,
    paxCount: payload.passengers.length,
    answersKeys: Object.keys(payload.answers ?? {}),
    mainContactQuestionIds: bokunRequest.directBooking.mainContactDetails.map(
      a => a.questionId,
    ),
    hasUti: typeof bokunRequest.uti === 'string' && bokunRequest.uti.length > 0,
    optionsMs: timing.optionsMs,
    submitMs: timing.submitMs,
    upstreamStatus: upstream.status,
    detail: upstream.detail,
  }
}

export function extractStripeUti(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as { options?: unknown }
  if (!Array.isArray(r.options)) return null
  for (const opt of r.options) {
    if (!opt || typeof opt !== 'object') continue
    const o = opt as { paymentMethods?: { paymentProviders?: unknown } }
    const providers = o.paymentMethods?.paymentProviders
    if (!Array.isArray(providers)) continue
    for (const prov of providers) {
      if (!prov || typeof prov !== 'object') continue
      const p = prov as {
        providerId?: string
        providerType?: string
        uti?: string
      }
      const isStripe = p.providerId === 'STRIPE_TOKEN' || p.providerType === 'TOKEN'
      if (isStripe && typeof p.uti === 'string' && p.uti.length > 0) {
        return p.uti
      }
    }
  }
  return null
}

/**
 * Builds the CheckoutRequest body for POST /checkout.json/submit.
 *
 * `uti` is optional in the type but practically required at runtime for
 * direct bookings — pass the value extracted via extractStripeUti() from
 * the prior /options/booking-request response.
 */
export function buildBokunPayload(
  b: CheckoutSubmitRequest,
  uti?: string,
): BokunCheckoutRequest {
  return {
    checkoutOption: 'CUSTOMER_FULL_PAYMENT',
    paymentMethod: 'CARD',
    source: 'DIRECT_REQUEST',
    currency: b.currency ?? 'USD',
    ...(uti ? { uti } : {}),
    paymentToken: b.paymentToken,
    directBooking: buildBokunOptionsRequest(b),
  }
}
