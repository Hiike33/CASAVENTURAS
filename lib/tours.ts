/**
 * Backward-compat shim.
 *
 * Preserves the original `@/lib/tours` import surface used across 17 call
 * sites while the real source of truth now lives in lib/cms/.
 *
 * Prefer the new API in new code:
 *   import { getCMS } from '@/lib/cms'
 *   const tours = await getCMS().getTours()
 *
 * This shim will be removed once all client components accept data via
 * props (Phase 2, when plugging a real CMS).
 */

export type { Tour, Review, SiteConfig } from '@/lib/types/cms'
export { tours } from '@/lib/cms/data/tours'
export { reviews } from '@/lib/cms/data/reviews'
export { siteConfig } from '@/lib/cms/data/site-config'
