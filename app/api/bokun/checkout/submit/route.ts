import { NextRequest, NextResponse } from 'next/server'
import { bokunFetch, BokunConfigError } from '@/lib/bokun/client'
import { resolveServerCheckoutMode } from '@/lib/bokun/checkout-mode'
import { simulatePromoValidation } from '@/lib/bokun/promo-devmock'
import {
  buildBokunOptionsRequest,
  buildBokunPayload,
  buildSubmitLogContext,
  coerceMainContactDetails,
  extractMainContactQuestions,
  extractStripeUti,
  type CheckoutSubmitRequest,
  type PassengerSubmit,
} from '@/lib/bokun/checkout-payload'

// POST /api/bokun/checkout/submit
//
// Atomic checkout endpoint — proxies Bókun's /checkout.json/submit with the
// guest info collected in CheckoutPanel + the Stripe token obtained via
// Stripe.js. Success is signaled by a `booking` object in the response.
//
// Behaviour depends on BOKUN_CHECKOUT_MODE:
//
//   disabled  — refuses the request (403). CheckoutPanel should never render
//               in this mode so reaching this branch means the flag got out
//               of sync between client and server; we fail safe.
//   dev-mock  — returns a fake confirmed booking after a short delay. No
//               Bókun call is made. Used during development to validate the
//               UX without creating real bookings in the client's account.
//   live      — real Bókun submit. Booking is created, card is charged.

export type { PassengerSubmit, CheckoutSubmitRequest }

type OkResponse = {
  ok: true
  mock?: boolean
  booking: {
    confirmationCode: string
    totalPrice?: number
    currency?: string
    productTitle?: string
  }
}
type ErrResponse = { ok: false; error: string; status?: number; detail?: unknown }

function randomCode(): string {
  return 'CV-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

function validate(body: Partial<CheckoutSubmitRequest>): string | null {
  if (!body.productId || !Number.isFinite(body.productId)) return 'productId required'
  if (!body.startTimeId) return 'startTimeId required'
  if (!body.rateId) return 'rateId required'
  if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return 'date (yyyy-MM-dd) required'
  if (!Array.isArray(body.passengers) || body.passengers.length === 0) {
    return 'passengers required (at least one)'
  }
  if (!body.mainContactDetails?.email) return 'email required'
  if (!body.paymentToken?.token) return 'paymentToken.token required'
  return null
}

export async function POST(req: NextRequest): Promise<NextResponse<OkResponse | ErrResponse>> {
  const mode = resolveServerCheckoutMode()
  if (mode === 'disabled') {
    return NextResponse.json(
      { ok: false, error: 'Checkout is disabled on this environment' },
      { status: 403 },
    )
  }

  let body: Partial<CheckoutSubmitRequest>
  try {
    body = (await req.json()) as Partial<CheckoutSubmitRequest>
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const err = validate(body)
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 })

  // Validated: body satisfies CheckoutSubmitRequest shape
  const payload = body as CheckoutSubmitRequest

  if (mode === 'dev-mock') {
    await new Promise(r => setTimeout(r, 700))
    const pax = payload.passengers.length
    const subtotal = pax * 100 // placeholder — real total comes from Bokun in live
    // Apply the same dev-mock catalog as /api/bokun/promo/validate so the
    // confirmation total matches what the UI showed in the preview.
    let totalPrice = subtotal
    if (payload.promoCode) {
      const sim = simulatePromoValidation(payload.promoCode, subtotal)
      if (sim.valid) totalPrice = Math.max(0, subtotal - sim.discount)
    }
    return NextResponse.json({
      ok: true,
      mock: true,
      booking: {
        confirmationCode: randomCode(),
        totalPrice,
        currency: payload.currency ?? 'USD',
        productTitle: `Product ${payload.productId}`,
      },
    })
  }

  // mode === 'live' — Bokun direct booking is a two-step flow:
  //   1. POST /checkout.json/options/booking-request → returns the
  //      payment options + the `uti` (unique transaction id) that
  //      authenticates the upcoming submit.
  //   2. POST /checkout.json/submit with the uti + Stripe payment token.
  // Skipping step 1 makes Bokun reject step 2 with
  // `logic.InvalidDataException - You must provide the uti …`.
  try {
    const t0 = Date.now()
    const optsBody = buildBokunOptionsRequest(payload)
    const optsRes = await bokunFetch('/checkout.json/options/booking-request', {
      method: 'POST',
      body: JSON.stringify(optsBody),
    })
    const optsData = (await optsRes.json().catch(() => null)) as unknown
    const optionsMs = Date.now() - t0
    if (!optsRes.ok) {
      console.error('[bokun/checkout/submit] options failed', {
        productId: payload.productId,
        startTimeId: payload.startTimeId,
        date: payload.date,
        paxCount: payload.passengers.length,
        optionsMs,
        status: optsRes.status,
        detail: optsData,
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'Bokun checkout options error',
          status: optsRes.status,
          detail: optsData,
        },
        { status: 502 },
      )
    }
    const uti = extractStripeUti(optsData)
    if (!uti) {
      console.error('[bokun/checkout/submit] no Stripe uti in options', {
        productId: payload.productId,
        optionsMs,
        optsData,
      })
      return NextResponse.json(
        {
          ok: false,
          error: 'No Stripe payment provider configured for this activity',
        },
        { status: 502 },
      )
    }

    // Coerce mainContactDetails against Bokun's question spec — covers the
    // case where the UI ships an inclusivity-default like `title='MX'` that
    // is not in the activity's accepted enum (e.g. El Yunque accepts only
    // MR/MRS/MISS). Without this, /submit returns InvalidAnswersException.
    const questions = extractMainContactQuestions(optsData)
    const bokunRequest = coerceMainContactDetails(
      buildBokunPayload(payload, uti),
      questions,
    )
    const t2 = Date.now()
    const res = await bokunFetch('/checkout.json/submit', {
      method: 'POST',
      body: JSON.stringify(bokunRequest),
    })
    const data = (await res.json().catch(() => null)) as unknown
    const submitMs = Date.now() - t2
    if (!res.ok) {
      console.error(
        '[bokun/checkout/submit] submit failed',
        buildSubmitLogContext(
          payload,
          bokunRequest,
          { status: res.status, detail: data },
          { optionsMs, submitMs },
        ),
      )
      return NextResponse.json(
        { ok: false, error: 'Bokun upstream error', status: res.status, detail: data },
        { status: 502 },
      )
    }
    const confirmed = data as { booking?: { confirmationCode?: string; totalPrice?: number } }
    if (!confirmed?.booking?.confirmationCode) {
      // Bókun can also return `redirectRequest` (3DS) or `dccQuote` — out of
      // scope for MVP. Flag as unexpected so the client can fall back to email.
      return NextResponse.json(
        {
          ok: false,
          error: 'Booking not confirmed (unexpected response shape)',
          detail: data,
        },
        { status: 502 },
      )
    }
    return NextResponse.json({
      ok: true,
      booking: {
        confirmationCode: confirmed.booking.confirmationCode,
        totalPrice: confirmed.booking.totalPrice,
        currency: payload.currency,
      },
    })
  } catch (e) {
    if (e instanceof BokunConfigError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
    }
    console.error('[bokun/checkout/submit] failed', {
      productId: payload.productId,
      startTimeId: payload.startTimeId,
      date: payload.date,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    })
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json(
      { ok: false, error: `Failed to submit to Bokun: ${msg}` },
      { status: 500 },
    )
  }
}
