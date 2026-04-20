import type { Tour, Review, SiteConfig, FAQ, Guide } from '@/lib/types/cms'
import type { CMSAdapter } from './adapter'
import type { Locale } from '@/i18n/routing'

// Static imports per locale. Next.js / Webpack tree-shake the ones that are
// unused on a given page, so bundle cost is paid only when needed.
import * as toursEn from './data/tours.en'
import * as toursEs from './data/tours.es'
import * as toursFr from './data/tours.fr'
import * as reviewsEn from './data/reviews.en'
import * as reviewsEs from './data/reviews.es'
import * as reviewsFr from './data/reviews.fr'
import * as configEn from './data/site-config.en'
import * as configEs from './data/site-config.es'
import * as configFr from './data/site-config.fr'
import * as faqsEn from './data/faqs.en'
import * as faqsEs from './data/faqs.es'
import * as faqsFr from './data/faqs.fr'
import * as guidesEn from './data/guides.en'
import * as guidesEs from './data/guides.es'
import * as guidesFr from './data/guides.fr'

const DATA = {
  en: { tours: toursEn, reviews: reviewsEn, config: configEn, faqs: faqsEn, guides: guidesEn },
  es: { tours: toursEs, reviews: reviewsEs, config: configEs, faqs: faqsEs, guides: guidesEs },
  fr: { tours: toursFr, reviews: reviewsFr, config: configFr, faqs: faqsFr, guides: guidesFr },
} as const

const DEFAULT_LOCALE: Locale = 'en'

/**
 * LocalAdapter — reads from static TypeScript files in lib/cms/data/.
 *
 * Default adapter: zero external dependency, zero network call, data bundled
 * at build time. Ideal for small sites and pre-CMS phase. When plugging a real
 * CMS, create e.g. SanityAdapter/ContentfulAdapter implementing the same
 * CMSAdapter interface and swap via lib/cms/index.ts.
 *
 * Locale dispatch: each method reads from DATA[locale]. Missing translations
 * are handled at the file level (tours.fr.ts just re-exports tours.en.ts
 * until a proper French translation lands).
 */
export class LocalAdapter implements CMSAdapter {
  async getTours(locale: Locale = DEFAULT_LOCALE): Promise<Tour[]> {
    return DATA[locale].tours.tours
  }

  async getTour(slug: string, locale: Locale = DEFAULT_LOCALE): Promise<Tour | null> {
    return DATA[locale].tours.tours.find(t => t.slug === slug) ?? null
  }

  async getReviews(filterTour?: string, locale: Locale = DEFAULT_LOCALE): Promise<Review[]> {
    const all = DATA[locale].reviews.reviews
    if (!filterTour) return all
    const needle = filterTour.toLowerCase()
    return all.filter(r => r.tour.toLowerCase().includes(needle))
  }

  async getSiteConfig(locale: Locale = DEFAULT_LOCALE): Promise<SiteConfig> {
    return DATA[locale].config.siteConfig
  }

  async getFaqs(tourSlug?: string, locale: Locale = DEFAULT_LOCALE): Promise<FAQ[]> {
    const { generalFaqs, tourFaqs } = DATA[locale].faqs
    if (!tourSlug) return generalFaqs
    return tourFaqs[tourSlug] ?? []
  }

  async getGuides(tourSlug?: string, locale: Locale = DEFAULT_LOCALE): Promise<Guide[]> {
    const all = DATA[locale].guides.guides
    if (!tourSlug) return all
    return all.filter(g => g.tours?.includes(tourSlug) ?? false)
  }
}
