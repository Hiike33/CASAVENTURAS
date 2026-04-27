/**
 * Final layer of price enrichment for the CMS adapter: replace
 * `tour.price` (snapshot value, ≤ 6h stale) with the live "starting from"
 * price fetched from Bokun (cached 60s upstream).
 *
 * Pure function — accepts the price fetcher as a parameter rather than
 * importing `getLiveStartingPrice` directly, so unit tests can run under
 * `node --test` without dragging the `next/cache` runtime (Next.js
 * server modules don't resolve in plain Node). LocalAdapter wires the
 * real fetcher in production.
 *
 * Failure mode is silent : on any error (network, BokunConfigError in
 * CI without creds, malformed response) the snapshot price is kept so
 * the page render never crashes — the user sees ≤6h-stale price instead
 * of an error.
 */

import type { Tour } from '../types/cms.ts'

export type LivePriceFetcher = (productId: number) => Promise<number | null>

export async function enrichWithLivePrices(
  tours: ReadonlyArray<Tour>,
  fetchPrice: LivePriceFetcher,
): Promise<Tour[]> {
  return Promise.all(
    tours.map(async t => {
      // Skip non-Bokun tours (dev fixtures, content-only entries, etc.).
      // Falsy check covers both undefined and 0 — neither is a valid id.
      if (!t.bokunProductId) return t
      try {
        const live = await fetchPrice(t.bokunProductId)
        return live !== null ? { ...t, price: live } : t
      } catch {
        return t
      }
    }),
  )
}
