/**
 * Bókun snapshot — Phase 1 build-time enrichment.
 *
 * The CMS (lib/cms/data/tours.{en,es,fr}.ts) holds translated narrative
 * content (name, description, highlights) plus numeric values the CMS
 * owns (price, duration). Bókun is the authoritative source for
 * commerce data: cancellation policy, pricing categories, start times,
 * and price structure.
 *
 * scripts/fetch-bokun-snapshot.ts queries Bókun at build time and writes
 * lib/cms/data/bokun-snapshot.json. The LocalAdapter imports that file
 * (webpack inlines it) and attaches every matching snapshot entry under
 * tour.bokunSnapshot via enrichToursWithSnapshot. Pages SSG with the
 * merged values, no runtime Bókun calls, no network dependency at
 * serve time. A fresh deploy = a fresh snapshot.
 *
 * Phase 1 scope: attach snapshot, consumers read ONLY cancellationHours
 * and startTimes. Price override is deferred — Bókun exposes multiple
 * rates (OTA/retail) whose mapping needs vendor validation before we
 * display an auto-fetched number that could contradict the public
 * widget. See decisions.md D-020 for the full staleness policy.
 *
 * Every function here is pure and fs/network-free so the unit tests in
 * snapshot.test.ts can exercise them without mocking.
 */

import type { Tour } from '../types/cms.ts'

export type BokunPricingCategory = {
  id: number
  title: string
  ticketCategory: string
  minAge?: number
  maxAge?: number
}

/** Raw rate-level pricing copied through from Bókun /activity + /availabilities */
export type BokunRatePrice = {
  activityRateId: number
  rateTitle?: string
  pricedPerPerson?: boolean
  /** Present when pricedPerPerson=true; one entry per pricingCategory id */
  pricePerCategoryUnit?: Array<{
    categoryId: number
    amount: number
    currency: string
  }>
  /** Present when pricedPerPerson=false; flat fee per booking (private charters) */
  pricePerBooking?: { amount: number; currency: string }
}

export type BokunTourSnapshot = {
  /** Bókun numeric experience id, echoed for traceability */
  productId: number
  /**
   * Hours before tour start at which the first non-zero cancellation
   * charge kicks in. Derived from cancellationPolicy.penaltyRules, so
   * "Free cancellation up to X hours" = X. Undefined when Bókun exposes
   * no penalty rule (tour is either fully flexible or fully non-refundable).
   */
  cancellationHours?: number
  /** Distinct start-time labels observed in the near-term availability window, e.g. ["08:00", "09:30"] */
  startTimes?: string[]
  /** Full pricing category list from Bókun (ADULT, CHILD, INFANT, …) */
  pricingCategories?: BokunPricingCategory[]
  /**
   * Rate-level pricing carried through for future display work.
   * Not consumed in Phase 1 — vendor mapping (OTA vs retail) must be
   * confirmed before we trust any single rate as the canonical price.
   */
  ratePrices?: BokunRatePrice[]
  /** ISO 8601 UTC — when the snapshot was fetched. Lets us warn on staleness. */
  fetchedAt: string
}

/** On-disk snapshot file: map slug → snapshot. */
export type BokunSnapshotMap = Record<string, BokunTourSnapshot>

/**
 * Bokun expresses cancellation as "within X hours of start, charge Y%".
 * "Free cancellation up to X hours" is the smallest cutoff at which a
 * non-zero charge kicks in — cancel earlier than that and you pay 0.
 * Example rules: [{24h, 100%}, {24000h, 0%}] → threshold = 24.
 */
export function deriveCancellationHours(
  rules: ReadonlyArray<{ cutoffHours: number; charge: number }> | undefined,
): number | undefined {
  if (!rules || rules.length === 0) return undefined
  const charging = rules.filter(r => r.charge > 0)
  if (charging.length === 0) return undefined
  return Math.min(...charging.map(r => r.cutoffHours))
}

/**
 * Attach a snapshot to each matching tour without mutating the price.
 * Pure function: same inputs → same outputs, no fs, no network. Tours
 * without a matching snapshot pass through unchanged.
 *
 * Why we do NOT override tour.price here:
 *   Live Bókun inspection showed defaultPrice is null on this vendor's
 *   availabilities; prices live in pricesByRate[] and can be net/OTA
 *   rates that differ from the retail widget price. Displaying the raw
 *   API number would mislead customers. The raw data is still carried
 *   under bokunSnapshot.ratePrices for a future price-aware commit once
 *   the vendor confirms which rate row is the retail source of truth.
 */
export function enrichToursWithSnapshot(
  tours: ReadonlyArray<Tour>,
  snapshot: BokunSnapshotMap,
): Tour[] {
  return tours.map(t => {
    const snap = snapshot[t.slug]
    if (!snap) return t
    return { ...t, bokunSnapshot: snap }
  })
}
