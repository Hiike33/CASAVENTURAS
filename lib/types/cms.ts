/**
 * CMS content types — source-agnostic.
 *
 * These types describe the shape of content regardless of where it comes from
 * (local files, Sanity, Contentful, Payload, etc.). Any CMS adapter must
 * conform to these.
 */

export type FAQ = {
  question: string
  answer: string
}

export type Guide = {
  /** Display name (first name or first + nickname, e.g. "Catherine La Taína") */
  name: string
  /** Role inside Casa Venturas, e.g. "Tour Guide", "Salsa Instructor" */
  jobTitle: string
  /** Optional tour slugs this guide is primarily associated with */
  tours?: string[]
  /** Optional bio blurb — used for Person.description in JSON-LD */
  description?: string
}

export type Tour = {
  slug: string
  name: string
  shortName: string
  category: string
  tagColor: string
  thumbBg: string
  price: number
  priceNote: string
  duration: string
  groupSize: string
  level?: string
  includes?: string
  description: string
  highlights: string[]
  whatToBring?: string[]
  address?: string
  time?: string
  heroTag: string
  photos: string[]
  galleryPhotos?: string[]
  video?: string
  tripAdvisorProductUrl?: string
  /** Tour-specific FAQs for FAQPage JSON-LD (P0 GEO lever) */
  faqs?: FAQ[]
}

export type Review = {
  text: string
  author: string
  tour: string
  guide?: string
  title: string
  rating: 5
  url: string
}

export type SiteConfig = {
  name: string
  tagline: string
  email: string
  phone: string
  whatsapp: string
  location: string
  hours: string
  url: string
  ogImage: string
  tripAdvisor: {
    rating: number
    reviews: number
    ranking: string
    url: string
  }
  social: {
    youtube: string
  }
  featured: Array<{ name: string; url?: string; note?: string }>
}
