/**
 * Shopping-cart helpers for Bókun promo code preview.
 *
 * This module isolates the pure, network-free logic used by the
 * /api/bokun/promo/validate route: payload construction, breakdown math,
 * defensive parsing of the ShoppingCart response, and error classification.
 *
 * The actual HTTP orchestration (POST /cart.json/{sid}/activity, GET
 * apply-promo-code, abort) lives in the route handler — keeping it out
 * of this module lets us test the business logic without mocking fetch.
 *
 * ⚠ The ShoppingCart response shape is only partially documented by
 * Bokun (`api-docs.bokun.dev/rest-v1.yaml` exposes totalPrice/totalPaid/
 * totalDue + currency but not an explicit discount field). Live
 * integration MUST be verified in staging with a real active promo code
 * before any release flips BOKUN_CHECKOUT_MODE to `live` for this
 * feature. The parser here is defensive — it reads whatever total field
 * is present and lets the caller compute the discount by diff.
 */

import type { PromoInvalidReason } from './promo-devmock.ts'

// ─── Types ────────────────────────────────────────────────────────────────

/** Minimal passenger entry accepted by Bókun ActivityBookingRequest. */
export type CartPassenger = {
  pricingCategoryId: number
}

/** Payload we send to POST /cart.json/{sessionId}/activity */
export type ActivityBookingRequest = {
  activityId: number
  startTimeId: number
  /** yyyy-MM-dd */
  date: string
  rateId: number
  passengers: CartPassenger[]
}

export type Breakdown = {
  /** Price before any discount. */
  subtotal: number
  /** Absolute discount amount (>= 0). */
  discount: number
  /** subtotal - discount (>= 0). */
  total: number
  currency: string
}

/**
 * Defensive shape of the ShoppingCart fields we read. Bokun returns
 * more than this (booking nodes, customer data, etc.) — we ignore all
 * of it to stay robust to non-breaking vendor changes.
 */
export type ShoppingCartMinimal = {
  totalPrice?: number
  totalDue?: number
  currency?: string
}

// ─── Helpers (pure) ───────────────────────────────────────────────────────

/**
 * Generate a fresh cart session id. Uses Web Crypto API (available in
 * both Node ≥ 19 and Edge runtimes) so the route can run anywhere.
 */
export function generateCartSessionId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  // Extremely unlikely fallback — only hit on very old Node.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nodeCrypto = require('node:crypto') as typeof import('node:crypto')
  return nodeCrypto.randomUUID()
}

/**
 * Build the payload for POST /cart.json/{sessionId}/activity. Passengers
 * are materialized from the per-category quantity map the UI holds —
 * one entry per unit, carrying only the pricingCategoryId (names are
 * collected later during checkout submit, not during preview).
 */
export function buildActivityBookingPayload(args: {
  productId: number
  startTimeId: number
  rateId: number
  date: string
  passengersByCategory: Record<number, number>
}): ActivityBookingRequest {
  const passengers: CartPassenger[] = []
  for (const [rawId, rawQty] of Object.entries(args.passengersByCategory)) {
    const categoryId = Number(rawId)
    const qty = Math.max(0, Math.floor(rawQty))
    for (let i = 0; i < qty; i++) passengers.push({ pricingCategoryId: categoryId })
  }
  return {
    activityId: args.productId,
    startTimeId: args.startTimeId,
    date: args.date,
    rateId: args.rateId,
    passengers,
  }
}

/**
 * Compute a breakdown from a brute subtotal and a discounted total.
 * All three numbers are clamped ≥ 0, and total never exceeds subtotal
 * (guards against upstream quirks or parse errors).
 */
export function computeBreakdown(
  subtotal: number,
  discountedTotal: number,
  currency: string,
): Breakdown {
  const s = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0
  const t = Number.isFinite(discountedTotal) ? Math.max(0, Math.min(discountedTotal, s)) : s
  // Round discount to 2 decimals to avoid float noise (e.g., 26.70000001).
  const discount = Math.round((s - t) * 100) / 100
  return { subtotal: s, discount, total: t, currency }
}

/**
 * Extract a numeric total from a ShoppingCart-shaped unknown. Tries
 * totalPrice first (Bokun's canonical field), falls back to totalDue,
 * returns null if neither is usable. Caller decides how to react.
 */
export function parseShoppingCartTotal(raw: unknown): number | null {
  if (!raw || typeof raw !== 'object') return null
  const cart = raw as ShoppingCartMinimal
  if (typeof cart.totalPrice === 'number' && Number.isFinite(cart.totalPrice)) {
    return cart.totalPrice
  }
  if (typeof cart.totalDue === 'number' && Number.isFinite(cart.totalDue)) {
    return cart.totalDue
  }
  return null
}

/** Extract currency or default to 'USD'. */
export function parseShoppingCartCurrency(raw: unknown): string {
  if (!raw || typeof raw !== 'object') return 'USD'
  const cart = raw as ShoppingCartMinimal
  return typeof cart.currency === 'string' && cart.currency.length > 0
    ? cart.currency
    : 'USD'
}

/**
 * Classify a Bokun upstream error response into a stable reason code
 * the UI can render. Bokun doesn't expose a machine-readable error
 * taxonomy for promo codes, so we match on status + body keywords.
 *
 * Contract:
 *   - 404 / not_found / not found / unknown    → 'invalid_code'
 *   - 400 / minimum / min / below / not met    → 'min_not_met'
 *   - 410 / expired / inactive                 → 'expired'
 *   - usage / limit / exhausted / quota        → 'usage_limit'
 *   - product / activity / not eligible / not applicable → 'product_not_eligible'
 *   - anything else                            → 'invalid_code' (safe default)
 */
export function classifyPromoError(
  status: number | undefined,
  bodyText: string | undefined,
): PromoInvalidReason {
  const body = (bodyText ?? '').toLowerCase()
  if (status === 410 || /expired|inactive|no longer/.test(body)) return 'expired'
  if (/minimum|\bmin\b|below|not met/.test(body)) return 'min_not_met'
  if (/usage|limit|exhausted|quota/.test(body)) return 'usage_limit'
  if (/not eligible|not applicable|product|activity/.test(body)) return 'product_not_eligible'
  if (status === 404 || /not found|unknown|invalid/.test(body)) return 'invalid_code'
  return 'invalid_code'
}
