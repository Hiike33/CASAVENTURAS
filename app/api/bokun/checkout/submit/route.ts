import { NextRequest, NextResponse } from 'next/server'
import { bokunFetch, BokunConfigError } from '@/lib/bokun/client'
import { resolveServerCheckoutMode } from '@/lib/bokun/checkout-mode'

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
}

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
    const pax = payload.passengers.reduce<number>((n, p) => n + 1, 0)
    return NextResponse.json({
      ok: true,
      mock: true,
      booking: {
        confirmationCode: randomCode(),
        totalPrice: pax * 100, // placeholder — real total comes from Bokun in live
        currency: payload.currency ?? 'USD',
        productTitle: `Product ${payload.productId}`,
      },
    })
  }

  // mode === 'live'
  const bokunRequest = buildBokunPayload(payload)
  try {
    const res = await bokunFetch('/checkout.json/submit', {
      method: 'POST',
      body: JSON.stringify(bokunRequest),
    })
    const data = (await res.json().catch(() => null)) as unknown
    if (!res.ok) {
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
    console.error('[bokun/checkout/submit] failed', e)
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json(
      { ok: false, error: `Failed to submit to Bokun: ${msg}` },
      { status: 500 },
    )
  }
}

/**
 * Maps our UI-friendly body to Bókun's CheckoutRequest schema. We keep
 * shape stable and only pass values the vendor configured (pickup, room,
 * custom address, answers). Bokun rejects fields it doesn't know.
 */
function buildBokunPayload(b: CheckoutSubmitRequest) {
  const answers = Object.entries(b.answers ?? {}).map(([id, answer]) => ({
    bookingQuestionId: Number(id),
    answer,
  }))
  const coord =
    b.customPickupLat !== undefined && b.customPickupLon !== undefined
      ? ` (${b.customPickupLat.toFixed(5)}, ${b.customPickupLon.toFixed(5)})`
      : ''
  const comment = [
    b.specialRequests,
    b.customPickupAddress && `Custom pickup: ${b.customPickupAddress}${coord}`,
    b.roomNumber && `Room: ${b.roomNumber}`,
  ]
    .filter(Boolean)
    .join(' · ')
  return {
    currency: b.currency ?? 'USD',
    activityBookings: [
      {
        activityId: b.productId,
        startTimeId: b.startTimeId,
        date: b.date,
        rateId: b.rateId,
        passengers: b.passengers.map(p => ({
          pricingCategoryId: p.pricingCategoryId,
          passengerDetails: [
            ...(p.firstName ? [{ field: 'FIRST_NAME', value: p.firstName }] : []),
            ...(p.lastName ? [{ field: 'LAST_NAME', value: p.lastName }] : []),
          ],
        })),
        ...(b.pickupPlaceId ? { pickup: true, pickupPlaceId: b.pickupPlaceId } : {}),
      },
    ],
    customer: {
      title: b.mainContactDetails.title,
      firstName: b.mainContactDetails.firstName,
      lastName: b.mainContactDetails.lastName,
      email: b.mainContactDetails.email,
      phoneNumber: b.mainContactDetails.phone,
    },
    paymentMethod: 'CARD',
    paymentToken: b.paymentToken,
    bookingQuestionAnswers: answers,
    customerComment: comment || undefined,
  }
}
