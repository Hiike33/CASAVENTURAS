/**
 * CMS content types — source-agnostic.
 *
 * These types describe the shape of content regardless of where it comes from
 * (local files, Sanity, Contentful, Payload, etc.). Any CMS adapter must
 * conform to these.
 */

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
