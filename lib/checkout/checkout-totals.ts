/**
 * Pure helpers for the checkout total computation. Lives apart from the
 * `useCheckoutTotal` React hook so the math is testable under
 * `node --test` without dragging in React/RTL.
 *
 * Two business modes are encoded :
 *
 * 1. Per-person (default) : the displayed total = sum over pricing
 *    categories of (qty * unit price). Falls back to tour.price when
 *    a category isn't in the priceByCategory map (snapshot drift, new
 *    category not yet propagated, etc.). When ctx hasn't loaded yet we
 *    show tour.price * max(1, totalGuests) as a sane placeholder.
 *
 * 2. Per-booking (private charters like the catamaran) : ONE flat fee
 *    regardless of guest count. priceByCategory is intentionally empty
 *    for these rates ; a naïve sum would over-bill the customer.
 *    `tour.pricedPerPerson === false` short-circuits to tour.price.
 *
 * Extracted from components/CheckoutPanel.tsx during Phase 2B-2.
 */

import type { CheckoutContext } from '@/app/api/bokun/checkout-context/route'
import type { Tour } from '@/lib/types/cms'

/**
 * Sum of guest counts across all pricing categories.
 * Defensive: drops non-finite or negative values.
 */
export function computeTotalGuests(qty: Record<number, number>): number {
  let n = 0
  for (const v of Object.values(qty)) {
    if (Number.isFinite(v) && v > 0) n += v
  }
  return n
}

export function computeTotal(
  ctx: CheckoutContext | null,
  qty: Record<number, number>,
  tour: Tour,
  priceByCategory: ReadonlyMap<number, number>,
): number {
  // Per-booking tours (private catamaran) : flat fee, ignore qty.
  if (tour.pricedPerPerson === false) return tour.price

  // Pre-context fallback : show a plausible price using the snapshot
  // value while the /checkout-context fetch is in flight.
  if (!ctx) {
    const guests = Math.max(1, computeTotalGuests(qty))
    return tour.price * guests
  }

  // Per-person : sum over pricing categories with priceByCategory
  // taking precedence (live or snapshot) and tour.price as ultimate
  // fallback for any category id not yet in the map.
  return ctx.pricingCategories.reduce((sum, c) => {
    const units = qty[c.id] ?? 0
    const rate = priceByCategory.get(c.id) ?? tour.price
    return sum + units * rate
  }, 0)
}
