/**
 * Pure helper for live "starting from" price extraction.
 *
 * Lives in its own module (separate from live-prices-cached.ts which
 * wraps it in `unstable_cache`) so this file can be imported by
 * `node --test` without dragging the `next/cache` runtime — Next.js
 * server modules don't resolve in plain Node.
 */

import type { BokunAvailability } from './types.ts'

/**
 * Pure: extract the minimum bookable starting price from a list of
 * Bokun availability slots. Skips soldOut/unavailable slots, ignores
 * amounts ≤ 0 or non-finite (defensive against Bokun shape drift).
 *
 * Per-person tours (most): reads pricesByRate[].pricePerCategoryUnit[].amount.amount
 * Per-booking tours (private charter): reads pricesByRate[].pricePerBooking.amount
 *
 * Returns null when no usable price is found — callers should fall
 * back to the snapshot price in that case.
 */
export function computeMinStartingPrice(
  slots: ReadonlyArray<BokunAvailability> | null | undefined,
): number | null {
  if (!Array.isArray(slots) || slots.length === 0) return null
  const prices: number[] = []
  for (const s of slots) {
    if (!s || s.soldOut || s.unavailable) continue
    const rates = s.pricesByRate
    if (!Array.isArray(rates)) continue
    for (const rate of rates) {
      if (!rate) continue
      for (const u of rate.pricePerCategoryUnit ?? []) {
        const amt = u?.amount?.amount
        if (typeof amt === 'number' && Number.isFinite(amt) && amt > 0) {
          prices.push(amt)
        }
      }
      const pb = rate.pricePerBooking?.amount
      if (typeof pb === 'number' && Number.isFinite(pb) && pb > 0) {
        prices.push(pb)
      }
    }
  }
  return prices.length > 0 ? Math.min(...prices) : null
}
