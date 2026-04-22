import { NextRequest, NextResponse } from 'next/server'
import { bokunFetch, BokunConfigError } from '@/lib/bokun/client'
import { resolveServerCheckoutMode } from '@/lib/bokun/checkout-mode'
import {
  buildActivityBookingPayload,
  classifyPromoError,
  computeBreakdown,
  generateCartSessionId,
  parseShoppingCartCurrency,
  parseShoppingCartTotal,
  type Breakdown,
} from '@/lib/bokun/cart'
import {
  simulatePromoValidation,
  type PromoInvalidReason,
} from '@/lib/bokun/promo-devmock'
import {
  validatePromoRequestBody,
  rateLimitHit,
  type PromoRequestBody,
} from '@/lib/bokun/promo-request'

// POST /api/bokun/promo/validate
//
// Preview-time endpoint for promo code validation. Orchestrates the
// Bokun cart-based flow so the UI can display a live discount breakdown
// BEFORE the user commits to payment.
//
// Modes (BOKUN_CHECKOUT_MODE):
//   disabled  — refuses the request (403). UI should not call in this mode.
//   dev-mock  — uses the deterministic catalog (lib/bokun/promo-devmock).
//               No Bokun calls. Subtotal comes from the request, discount
//               is simulated. Same catalog used by submit's dev-mock so
//               preview ↔ submit totals stay coherent.
//   live      — orchestrates:
//                 1) POST /cart.json/{sid}/activity       (create + seed)
//                 2) GET  /cart.json/{sid}/apply-promo-code/{code}
//                 3) read totals from the returned ShoppingCart
//                 4) fire-and-forget: GET /cart.json/{sid}/remove-promo-code
//               ⚠ Live path is coded defensively against the documented
//               surface but relies on HYP-1 (auto-create on first POST)
//               and HYP-2 (ShoppingCart exposes totalPrice). Staging
//               verification is required before production use.

export type PromoValidateRequest = PromoRequestBody

export type PromoValidateResponse =
  | {
      ok: true
      valid: true
      code: string
      subtotal: number
      discount: number
      total: number
      currency: string
    }
  | {
      ok: true
      valid: false
      reason: PromoInvalidReason
      code?: string
      minSubtotal?: number
    }
  | { ok: false; error: string; status?: number }

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest): Promise<NextResponse<PromoValidateResponse>> {
  const mode = resolveServerCheckoutMode()
  if (mode === 'disabled') {
    return NextResponse.json(
      { ok: false, error: 'Checkout is disabled on this environment' },
      { status: 403 },
    )
  }

  const ip = clientIp(req)
  if (rateLimitHit(ip)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests, slow down and retry in a minute' },
      { status: 429 },
    )
  }

  let raw: Partial<PromoValidateRequest>
  try {
    raw = (await req.json()) as Partial<PromoValidateRequest>
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON' }, { status: 400 })
  }

  const err = validatePromoRequestBody(raw)
  if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 })

  const body = raw as PromoValidateRequest
  const currency = body.currency ?? 'USD'

  if (mode === 'dev-mock') {
    const sim = simulatePromoValidation(body.promoCode, body.subtotal)
    if (!sim.valid) {
      return NextResponse.json({
        ok: true,
        valid: false,
        reason: sim.reason,
        code: sim.code,
        minSubtotal: sim.minSubtotal,
      })
    }
    const breakdown: Breakdown = computeBreakdown(
      body.subtotal,
      body.subtotal - sim.discount,
      currency,
    )
    return NextResponse.json({
      ok: true,
      valid: true,
      code: sim.code,
      subtotal: breakdown.subtotal,
      discount: breakdown.discount,
      total: breakdown.total,
      currency: breakdown.currency,
    })
  }

  // mode === 'live' — cart-based orchestration.
  try {
    const sessionId = generateCartSessionId()
    const activityPayload = buildActivityBookingPayload({
      productId: body.productId,
      startTimeId: body.startTimeId,
      rateId: body.rateId,
      date: body.date,
      passengersByCategory: body.passengersByCategory,
    })

    const addRes = await bokunFetch(`/cart.json/${sessionId}/activity`, {
      method: 'POST',
      body: JSON.stringify(activityPayload),
    })
    if (!addRes.ok) {
      return NextResponse.json(
        { ok: false, error: 'Cart add-activity failed', status: addRes.status },
        { status: 502 },
      )
    }
    const brutCart = await addRes.json().catch(() => null)
    const subtotalUpstream = parseShoppingCartTotal(brutCart) ?? body.subtotal
    const currencyUpstream = parseShoppingCartCurrency(brutCart) || currency

    const promo = encodeURIComponent(body.promoCode.trim())
    const applyRes = await bokunFetch(
      `/cart.json/${sessionId}/apply-promo-code/${promo}`,
    )
    if (!applyRes.ok) {
      const text = await applyRes.text().catch(() => '')
      const reason = classifyPromoError(applyRes.status, text)
      void bokunFetch(`/cart.json/${sessionId}/remove-promo-code`).catch(() => {})
      return NextResponse.json({
        ok: true,
        valid: false,
        reason,
        code: body.promoCode.trim().toUpperCase(),
      })
    }

    const discountedCart = await applyRes.json().catch(() => null)
    const totalDiscounted = parseShoppingCartTotal(discountedCart)
    if (totalDiscounted === null) {
      void bokunFetch(`/cart.json/${sessionId}/remove-promo-code`).catch(() => {})
      return NextResponse.json(
        {
          ok: false,
          error: 'ShoppingCart response missing total field (staging verification required)',
        },
        { status: 502 },
      )
    }

    if (totalDiscounted >= subtotalUpstream) {
      void bokunFetch(`/cart.json/${sessionId}/remove-promo-code`).catch(() => {})
      return NextResponse.json({
        ok: true,
        valid: false,
        reason: 'product_not_eligible',
        code: body.promoCode.trim().toUpperCase(),
      })
    }

    const breakdown = computeBreakdown(subtotalUpstream, totalDiscounted, currencyUpstream)
    void bokunFetch(`/cart.json/${sessionId}/remove-promo-code`).catch(() => {})

    return NextResponse.json({
      ok: true,
      valid: true,
      code: body.promoCode.trim().toUpperCase(),
      subtotal: breakdown.subtotal,
      discount: breakdown.discount,
      total: breakdown.total,
      currency: breakdown.currency,
    })
  } catch (e) {
    if (e instanceof BokunConfigError) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
    }
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json(
      { ok: false, error: `promo validate failed: ${msg}` },
      { status: 500 },
    )
  }
}
