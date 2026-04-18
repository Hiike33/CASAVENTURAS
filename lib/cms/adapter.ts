import type { Tour, Review, SiteConfig } from '@/lib/types/cms'

/**
 * CMSAdapter — source-agnostic interface for content retrieval.
 *
 * Any adapter (local file system, Sanity, Contentful, Payload, Strapi, etc.)
 * must implement this interface. This lets us swap the data source without
 * changing any consumer code.
 *
 * All methods return Promises to allow async implementations (real CMS
 * typically fetch over HTTP). The local implementation wraps sync data in
 * Promise.resolve — zero perf cost at build/render time.
 */
export interface CMSAdapter {
  /** Return all tours, in display order. */
  getTours(): Promise<Tour[]>

  /** Return a single tour by its slug, or null if not found. */
  getTour(slug: string): Promise<Tour | null>

  /**
   * Return customer reviews.
   * @param filterTour optional case-insensitive substring match against Review.tour
   */
  getReviews(filterTour?: string): Promise<Review[]>

  /** Return site-wide config (contact, brand, social, proof). */
  getSiteConfig(): Promise<SiteConfig>
}
