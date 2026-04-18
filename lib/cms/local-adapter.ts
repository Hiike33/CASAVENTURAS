import type { Tour, Review, SiteConfig, FAQ, Guide } from '@/lib/types/cms'
import type { CMSAdapter } from './adapter'
import { tours } from './data/tours'
import { reviews } from './data/reviews'
import { siteConfig } from './data/site-config'
import { generalFaqs, tourFaqs } from './data/faqs'
import { guides } from './data/guides'

/**
 * LocalAdapter — reads from static TypeScript files in lib/cms/data/.
 *
 * Default adapter: zero external dependency, zero network call, data bundled
 * at build time. Ideal for small sites and pre-CMS phase. When plugging a real
 * CMS, create e.g. SanityAdapter/ContentfulAdapter implementing the same
 * CMSAdapter interface and swap via lib/cms/index.ts.
 */
export class LocalAdapter implements CMSAdapter {
  async getTours(): Promise<Tour[]> {
    return tours
  }

  async getTour(slug: string): Promise<Tour | null> {
    return tours.find(t => t.slug === slug) ?? null
  }

  async getReviews(filterTour?: string): Promise<Review[]> {
    if (!filterTour) return reviews
    const needle = filterTour.toLowerCase()
    return reviews.filter(r => r.tour.toLowerCase().includes(needle))
  }

  async getSiteConfig(): Promise<SiteConfig> {
    return siteConfig
  }

  async getFaqs(tourSlug?: string): Promise<FAQ[]> {
    if (!tourSlug) return generalFaqs
    return tourFaqs[tourSlug] ?? []
  }

  async getGuides(tourSlug?: string): Promise<Guide[]> {
    if (!tourSlug) return guides
    return guides.filter(g => g.tours?.includes(tourSlug) ?? false)
  }
}
