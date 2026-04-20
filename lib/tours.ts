/**
 * Backward-compat shim for sync Client Component imports.
 *
 * Returns the EN (default locale) content. Locale-aware Server Components
 * should use `getCMS().getTours(locale)` from `@/lib/cms` instead.
 *
 * All 17 call sites of `@/lib/tours` are in Client Components that don't
 * yet receive props from a localized server parent (Nav, etc.). Those
 * display EN content even on /es or /fr routes for now; translating them
 * is a Phase 2b refactor and tracked in D-018.
 */

export type { Tour, Review, SiteConfig } from '@/lib/types/cms'
export { tours } from '@/lib/cms/data/tours.en'
export { reviews } from '@/lib/cms/data/reviews.en'
export { siteConfig } from '@/lib/cms/data/site-config.en'
