/**
 * Cache-wrapped fetch of the lowest "starting from" price for a Bokun
 * product. Server-side only (uses next/cache).
 *
 * Architecture:
 *   • computeMinStartingPrice (lib/bokun/live-prices.ts) is the pure
 *     helper — fully unit-tested, framework-free.
 *   • getLiveStartingPrice (this file) wraps a Bokun fetch + the pure
 *     helper inside `unstable_cache` for 60s deduplication. TTL choice :
 *     short enough that Bokun price changes propagate quickly without
 *     redeploy, long enough that 1000 visitors/min cost ~1 Bokun call.
 *   • Cache tag 'bokun-prices' lets us add `revalidateTag('bokun-prices')`
 *     later (when/if Bokun adds product webhooks) for instant invalidation.
 *
 * Failure mode is silent: returns null on any error (network, malformed
 * response, missing creds, no bookable slots). The caller — currently
 * LocalAdapter.getTours / getTour — falls back to the snapshot price
 * silently so a Bokun outage never breaks the home page render.
 */

import { unstable_cache } from 'next/cache'
import { bokunFetch } from './client.ts'
import { computeMinStartingPrice } from './live-prices.ts'
import type { BokunAvailability } from './types.ts'

const WINDOW_DAYS = 30
const CACHE_TTL_SECONDS = 60

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function futureIso(days: number, from: Date = new Date()): string {
  return new Date(from.getTime() + days * 86400e3).toISOString().slice(0, 10)
}

export const getLiveStartingPrice = unstable_cache(
  async (productId: number): Promise<number | null> => {
    if (!Number.isInteger(productId) || productId <= 0) return null
    try {
      const path = `/activity.json/${productId}/availabilities?start=${todayIso()}&end=${futureIso(WINDOW_DAYS)}`
      const res = await bokunFetch(path)
      if (!res.ok) return null
      const slots = (await res.json()) as unknown
      return computeMinStartingPrice(slots as BokunAvailability[])
    } catch {
      return null
    }
  },
  ['bokun-live-starting-price'],
  { revalidate: CACHE_TTL_SECONDS, tags: ['bokun-prices'] },
)
