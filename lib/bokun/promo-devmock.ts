/**
 * Deterministic promo-code simulator used in BOKUN_CHECKOUT_MODE=dev-mock.
 *
 * Bokun live calls are not made in dev-mock — this module provides a
 * stable catalog so the UX can be exercised end-to-end (valid applied,
 * expired, minimum-not-met, invalid, usage-exhausted) without any
 * vendor dependency. The catalog is intentionally tiny and human-readable:
 * adding a new scenario = one line.
 *
 * Case-insensitivity matches Bokun live behavior (codes typed by users
 * are normalized upstream).
 */

export type PromoInvalidReason =
  | 'invalid_code'
  | 'expired'
  | 'min_not_met'
  | 'usage_limit'
  | 'product_not_eligible'

export type PromoSimResult =
  | {
      valid: true
      /** Normalized code that was applied (uppercased). */
      code: string
      /** Absolute discount amount in subtotal currency units. */
      discount: number
    }
  | {
      valid: false
      reason: PromoInvalidReason
      /** Echoed back only if the code shape looked reasonable (helps UX). */
      code?: string
      /** Extra hint for the UI (e.g., minimum amount not met). */
      minSubtotal?: number
    }

type CatalogEntry = {
  /** % off, or $ off flat (exactly one is set). */
  percentOff?: number
  flatOff?: number
  /** Minimum subtotal required (before discount) for the code to apply. */
  minSubtotal?: number
  /** If set, simulation returns this error instead of a discount. */
  forceReason?: PromoInvalidReason
}

/**
 * Dev-mock catalog. Keep small — this is not a vendor DB, just enough
 * coverage to exercise every UI branch. Codes are stored uppercased;
 * lookups normalize the user input first.
 */
const CATALOG: ReadonlyMap<string, CatalogEntry> = new Map([
  ['SUMMER10', { percentOff: 10 }],
  ['WELCOME20', { percentOff: 20, minSubtotal: 100 }],
  ['FLAT25', { flatOff: 25, minSubtotal: 50 }],
  ['EXPIRED', { forceReason: 'expired' }],
  ['SOLDOUT', { forceReason: 'usage_limit' }],
])

/**
 * Validate a user-entered code against the dev-mock catalog.
 *
 * Pure function — same (code, subtotal) pair always yields the same
 * result. No time-of-day, no randomness. Tests can rely on this.
 *
 * @param rawCode  The user input, any case, any surrounding whitespace.
 * @param subtotal The current subtotal (used for min-subtotal rules).
 */
export function simulatePromoValidation(
  rawCode: string,
  subtotal: number,
): PromoSimResult {
  const code = rawCode.trim().toUpperCase()
  if (!code) return { valid: false, reason: 'invalid_code' }

  const entry = CATALOG.get(code)
  if (!entry) return { valid: false, reason: 'invalid_code', code }

  if (entry.forceReason) {
    return { valid: false, reason: entry.forceReason, code }
  }

  if (entry.minSubtotal !== undefined && subtotal < entry.minSubtotal) {
    return {
      valid: false,
      reason: 'min_not_met',
      code,
      minSubtotal: entry.minSubtotal,
    }
  }

  let discount = 0
  if (entry.percentOff !== undefined) {
    discount = Math.round(subtotal * entry.percentOff) / 100
  } else if (entry.flatOff !== undefined) {
    discount = entry.flatOff
  }
  discount = Math.min(discount, subtotal) // never exceed subtotal

  return { valid: true, code, discount }
}

/**
 * List of known dev-mock codes — exposed so tests and docs can discover
 * the catalog without importing the private CATALOG map. The caller
 * must treat this as informational, not authoritative.
 */
export const DEV_MOCK_CODES: ReadonlyArray<string> = Array.from(CATALOG.keys())
