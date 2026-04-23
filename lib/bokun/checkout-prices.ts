/**
 * Price resolver for the checkout UI.
 *
 * Produces a Map<categoryId, unitPrice> from either :
 *   1. the LIVE availability slot (`pricesByRate` from Bokun's
 *      /activity/{id}/availabilities response, fresh at page load), or
 *   2. the build-time SNAPSHOT (`tour.bokunSnapshot.ratePrices`, ≤ 6h stale).
 *
 * Runtime takes priority: if the slot exposes `pricesByRate` with at least
 * one valid entry, we use it. Otherwise we fall back to the snapshot — the
 * UI never shows an unavailable price.
 *
 * The two sources have *different shapes*:
 *   runtime  : `{ id, amount: { amount, currency } }` (raw Bokun passthrough)
 *   snapshot : `{ categoryId, amount, currency }` (normalized at build time)
 * This module normalizes both into a plain Map<number, number>.
 *
 * Pure, network-free, framework-free — testable in isolation.
 */

import type { BokunRatePrice } from './snapshot.ts'

/** Shape of the runtime `pricesByRate[]` entry as Bokun returns it. */
export type RuntimeRatePrice = {
  activityRateId: number
  pricePerCategoryUnit?: Array<{
    id: number
    amount: { amount: number; currency: string }
  }>
  pricePerBooking?: { amount: number; currency: string }
}

/**
 * Resolve per-category unit prices for the checkout UI.
 *
 * @param runtime         The `pricesByRate` array from the selected live slot
 *                        (passed down by BookingSidebar / HomeBookingForm).
 * @param snapshot        The `ratePrices` array from tour.bokunSnapshot
 *                        (build-time frozen, up to 6h stale).
 * @param preferredRateId The rate the UI is checking out against
 *                        (slot.defaultRateId). If a rate with this id exists
 *                        it is chosen; otherwise the first rate is used.
 * @returns Map<categoryId, unitPrice>. Empty map means neither source
 *          yielded a usable price — caller should fall back to tour.price.
 */
export function resolveCheckoutPriceMap(args: {
  runtime?: ReadonlyArray<RuntimeRatePrice>
  snapshot?: ReadonlyArray<BokunRatePrice>
  preferredRateId?: number
}): Map<number, number> {
  const map = new Map<number, number>()

  // Runtime source first — fresh prices if available.
  if (args.runtime && args.runtime.length > 0) {
    const rate =
      (args.preferredRateId !== undefined
        ? args.runtime.find(r => r.activityRateId === args.preferredRateId)
        : undefined) ?? args.runtime[0]
    for (const u of rate?.pricePerCategoryUnit ?? []) {
      const id = u?.id
      const amt = u?.amount?.amount
      if (Number.isInteger(id) && Number.isFinite(amt) && amt >= 0) {
        map.set(id, amt)
      }
    }
    if (map.size > 0) return map
  }

  // Fallback to snapshot (build-time).
  if (args.snapshot && args.snapshot.length > 0) {
    const rate =
      (args.preferredRateId !== undefined
        ? args.snapshot.find(r => r.activityRateId === args.preferredRateId)
        : undefined) ?? args.snapshot[0]
    for (const u of rate?.pricePerCategoryUnit ?? []) {
      if (Number.isInteger(u?.categoryId) && Number.isFinite(u?.amount) && u.amount >= 0) {
        map.set(u.categoryId, u.amount)
      }
    }
  }

  return map
}
