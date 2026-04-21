/**
 * Backward-compat shim for sync Client Component imports.
 *
 * Returns the EN (default locale) content , but already enriched with
 * the Bokun snapshot (D-020 Phase 5: tour.price is overridden with the
 * live retail rate from the vendor widget, and tour.pricedPerPerson is
 * set from the rate config). This keeps "ONE source" of tour data ,
 * legacy client components (Hero, TourCard, Nav, etc.) and the modern
 * adapter path (getCMS().getTours, toursFor) both return the SAME
 * enriched objects instead of two divergent copies.
 *
 * Locale-aware Server Components still prefer `getCMS().getTours(locale)`
 * for ES/FR content. Client components stuck on this shim display EN.
 */

import { enrichToursWithSnapshot, type BokunSnapshotMap } from '@/lib/bokun/snapshot'
import { tours as rawTours } from '@/lib/cms/data/tours.en'
import bokunSnapshot from '@/lib/cms/data/bokun-snapshot.json'

export type { Tour, Review, SiteConfig } from '@/lib/types/cms'
export const tours = enrichToursWithSnapshot(rawTours, bokunSnapshot as BokunSnapshotMap)
export { reviews } from '@/lib/cms/data/reviews.en'
export { siteConfig } from '@/lib/cms/data/site-config.en'
