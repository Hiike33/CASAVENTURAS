import type { Tour, Review, SiteConfig, FAQ, Guide } from '@/lib/types/cms'
import type { Locale } from '@/i18n/routing'

/**
 * CMSAdapter — source-agnostic interface for content retrieval.
 *
 * Any adapter (local file system, Sanity, Contentful, Payload, Strapi, etc.)
 * must implement this interface. This lets us swap the data source without
 * changing any consumer code.
 *
 * All methods accept an optional `locale` parameter. Adapters must fall back
 * to the default locale (EN) when the requested locale is missing translations.
 *
 * All methods return Promises to allow async implementations (real CMS
 * typically fetch over HTTP). The local implementation wraps sync data in
 * Promise.resolve — zero perf cost at build/render time.
 */
export interface CMSAdapter {
  /** Return all tours, in display order. */
  getTours(locale?: Locale): Promise<Tour[]>

  /** Return a single tour by its slug, or null if not found. */
  getTour(slug: string, locale?: Locale): Promise<Tour | null>

  /**
   * Return customer reviews.
   * @param filterTour optional case-insensitive substring match against Review.tour
   */
  getReviews(filterTour?: string, locale?: Locale): Promise<Review[]>

  /** Return site-wide config (contact, brand, social, proof). */
  getSiteConfig(locale?: Locale): Promise<SiteConfig>

  /**
   * Return FAQs. When `tourSlug` is provided, returns tour-specific FAQs;
   * otherwise returns general (brand-wide) FAQs.
   */
  getFaqs(tourSlug?: string, locale?: Locale): Promise<FAQ[]>

  /**
   * Return named guides. When `tourSlug` is provided, returns only guides
   * associated with that tour.
   */
  getGuides(tourSlug?: string, locale?: Locale): Promise<Guide[]>
}
