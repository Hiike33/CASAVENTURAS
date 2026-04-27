/**
 * Pure helpers for the checkout submit flow.
 *
 * Three responsibilities, each isolated for unit testing under
 * `node --test` (no React, no Stripe, no DOM, no fetch) :
 *
 *   1. validateSubmitPreflight — pre-flight guards (ctx, stripe,
 *      elements, card, promo). Returns a discriminated union so the
 *      caller can dispatch on errorKey without forgetting a case.
 *
 *   2. buildSubmitBody — constructs the body POSTed to
 *      /api/bokun/checkout/submit. Returns a `CheckoutSubmitRequest`
 *      so client and server share the same shape — the type lives
 *      in lib/bokun/checkout-payload.ts (server's source of truth).
 *      A drift between client builder and server expectations becomes
 *      a TypeScript error, not a silent runtime bug.
 *
 *   3. checkPriceMismatch — invariant guard between the preview total
 *      shown to the user and the total Bokun actually charged. A
 *      drift > 1 cent is flagged for logging (promo expired, stale
 *      basket, vendor rounding, etc.).
 *
 * Extracted from components/CheckoutPanel.tsx during Phase 3A
 * (audit 2026-04-26). Coverage : ~20 unit tests.
 */

import type { CheckoutContext } from '@/app/api/bokun/checkout-context/route'
import type { CheckoutSubmitRequest } from '@/lib/bokun/checkout-payload'

// ─── Types ─────────────────────────────────────────────────────────────────

/**
 * Shape of CheckoutPanel's local form state. Lifted to a named type so
 * buildSubmitBody can be typed precisely (vs. an inline anonymous shape
 * that drifts silently when CheckoutPanel adds a field).
 */
export type CheckoutFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  pickupId: number | null
  pickupTitle: string
  roomNumber: string
  customPickup: boolean
  customPickupAddress: string
  customPickupLat: number | undefined
  customPickupLon: number | undefined
  answers: Record<number, string>
  requests: string
}

export type PromoState = 'idle' | 'checking' | 'valid' | 'invalid'

export type PromoBreakdown = {
  subtotal: number
  discount: number
  total: number
  currency: string
  code: string
}

export type PreflightErrorKey =
  | 'ctxMissing'
  | 'paymentLibraryNotReady'
  | 'cardNotFound'
  | 'promoMustValidateBeforePay'

export type PreflightResult =
  | { ok: true }
  | { ok: false; errorKey: PreflightErrorKey }

export type PriceMismatch = {
  preview: number
  bokun: number
  code?: string
}

// Tolerance for the preview/Bokun total invariant. 1 cent absorbs
// float-rounding noise without masking a real promo-expired drift.
const PRICE_MISMATCH_TOLERANCE = 0.01

// ─── 1) Pre-flight guards ─────────────────────────────────────────────────

/**
 * Walks the same guard ladder handleSubmit ran inline before extraction.
 * Order matters : ctx is checked first so the caller can early-return
 * silently when the context is still loading (not a real error).
 *
 * Inputs are typed as `unknown` for the references we only need to
 * null-check — that lets the React caller pass `Stripe | null`,
 * `StripeElements | null`, `StripeCardElement | null` without forcing
 * us to import the @stripe/* types here.
 */
export function validateSubmitPreflight(args: {
  ctx: unknown
  stripe: unknown
  elements: unknown
  card: unknown
  promoInput: string
  promoState: PromoState
}): PreflightResult {
  if (!args.ctx) return { ok: false, errorKey: 'ctxMissing' }
  if (!args.stripe || !args.elements) {
    return { ok: false, errorKey: 'paymentLibraryNotReady' }
  }
  if (!args.card) return { ok: false, errorKey: 'cardNotFound' }
  if (args.promoInput.trim() && args.promoState !== 'valid') {
    return { ok: false, errorKey: 'promoMustValidateBeforePay' }
  }
  return { ok: true }
}

// ─── 2) Build the submit body ─────────────────────────────────────────────

/**
 * Maps the local React form state + the live Bokun context into the
 * exact shape the server route expects (CheckoutSubmitRequest).
 *
 * The cascade rules around customPickup are critical : when the user
 * toggles to "Enter custom address", we must NOT leak any leftover
 * pickupPlaceId or roomNumber from a previous listed-pickup selection
 * (that would confuse the Bokun-side merge logic). Mirror : when
 * staying on listed pickup, we must NOT send customPickupAddress even
 * if the form retained a value from an earlier toggle.
 *
 * `needsTitleField` is precomputed by the caller (from
 * ctx.requiredCustomerFields.includes('title')) rather than passing the
 * full ctx slice — keeps this function dependency-free of the
 * required-fields heuristic.
 */
export function buildSubmitBody(args: {
  form: CheckoutFormState
  qty: Record<number, number>
  ctx: CheckoutContext
  startTimeId: number
  rateId: number
  date: string
  tokenId: string
  promoState: PromoState
  promoBreakdown: PromoBreakdown | null
  needsTitleField: boolean
}): CheckoutSubmitRequest {
  const {
    form,
    qty,
    ctx,
    startTimeId,
    rateId,
    date,
    tokenId,
    promoState,
    promoBreakdown,
    needsTitleField,
  } = args

  // Expand qty map → flat passenger list. Each pricing category
  // contributes `qty[c.id]` entries. Names are duplicated from the
  // lead booker — Bokun requires a name per passenger but the form
  // doesn't collect them individually (intentional UX simplification).
  const passengers = ctx.pricingCategories.flatMap(c =>
    Array.from({ length: qty[c.id] ?? 0 }, () => ({
      pricingCategoryId: c.id,
      firstName: form.firstName,
      lastName: form.lastName,
    })),
  )

  return {
    productId: ctx.productId,
    startTimeId,
    rateId,
    date,
    passengers,
    pickupPlaceId:
      !form.customPickup && form.pickupId ? form.pickupId : undefined,
    roomNumber: !form.customPickup ? form.roomNumber || undefined : undefined,
    customPickupAddress: form.customPickup
      ? form.customPickupAddress
      : undefined,
    customPickupLat: form.customPickup ? form.customPickupLat : undefined,
    customPickupLon: form.customPickup ? form.customPickupLon : undefined,
    mainContactDetails: {
      // 'MX' is the gender-neutral default for tours where Bokun marked
      // title as required (see audit 2026-04-26). Activities accepting
      // it are coerced server-side; the rest fall back via Bokun's
      // own answerOptions in coerceMainContactDetails.
      title: needsTitleField ? 'MX' : undefined,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone || undefined,
    },
    answers: form.answers,
    specialRequests: form.requests || undefined,
    paymentToken: { token: tokenId },
    currency: 'USD',
    ...(promoState === 'valid' && promoBreakdown
      ? { promoCode: promoBreakdown.code }
      : {}),
  }
}

// ─── 3) Preview/Bokun mismatch invariant ──────────────────────────────────

/**
 * Compares the preview total (what the UI displayed) with the total
 * Bokun confirmed at /submit. A divergence > 1 cent signals one of :
 *   • promo code expired between preview and submit
 *   • basket changed faster than the preview re-fetch debounce
 *   • Bokun applied a vendor-side fee/discount we didn't render
 *
 * Returns the mismatch payload for logging when flagged, null
 * otherwise. Callers should NOT block the success path on this — it's
 * a telemetry signal, not a guard.
 */
export function checkPriceMismatch(args: {
  preview: number
  bokunTotal: number | undefined
  promoCode?: string
}): PriceMismatch | null {
  if (args.bokunTotal === undefined) return null
  if (Math.abs(args.bokunTotal - args.preview) <= PRICE_MISMATCH_TOLERANCE) {
    return null
  }
  return {
    preview: args.preview,
    bokun: args.bokunTotal,
    ...(args.promoCode !== undefined && { code: args.promoCode }),
  }
}
