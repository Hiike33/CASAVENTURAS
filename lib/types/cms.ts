/**
 * CMS content types — source-agnostic.
 *
 * These types describe the shape of content regardless of where it comes from
 * (local files, Sanity, Contentful, Payload, etc.). Any CMS adapter must
 * conform to these.
 */

export type FAQ = {
  /** Stable id used by Cavi intent matcher to reference this answer (e.g. "gen-pickup", "ey-fitness"). */
  id: string
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
  /**
   * Whether the price is charged per guest (true, default) or as a flat
   * fee for the whole booking (false, e.g. private catamaran charter).
   * Overridden at enrichment time from the Bokun rate config , see
   * lib/bokun/snapshot.ts::enrichToursWithSnapshot. If absent, treated
   * as per-person (back-compat for tours created before Phase 5).
   */
  pricedPerPerson?: boolean
  priceNote: string
  duration: string
  groupSize: string
  level?: string
  includes?: string
  description: string
  highlights: string[]
  whatToBring?: string[]
  address?: string
  /**
   * Geographic coordinates of the tour's primary location, used to
   * enrich the TouristTrip JSON-LD with `itinerary.geo` so search
   * engines can place the experience on a map and surface it for
   * "things to do near {place}" local searches.
   *
   * Coordinates point to the tour's HEART (the rainforest center, the
   * destination beach, the dance studio), not to the meeting point —
   * the meeting point lives in `address`. Same lat/lon across locales.
   */
  geo?: { latitude: number; longitude: number }
  heroTag: string
  photos: string[]
  galleryPhotos?: string[]
  video?: string
  tripAdvisorProductUrl?: string
  /** Tour-specific FAQs for FAQPage JSON-LD (P0 GEO lever) */
  faqs?: FAQ[]
  /** Bókun numeric experience ID — wired from env var at build time */
  bokunProductId?: number
  /**
   * Authoritative Bókun snapshot merged in at build time by
   * lib/bokun/snapshot.ts. When present, downstream UI should prefer
   * these values (price, cancellationHours, pricingCategories, startTimes)
   * over the locally cached narrative fields. See decisions.md D-020.
   */
  bokunSnapshot?: import('@/lib/bokun/snapshot').BokunTourSnapshot
}

/**
 * TOFU/MOFU editorial content block — structured body for Article.
 * Same rationale as LegalBlock (author-controlled, inline markup via html).
 * callout variants render with distinctive background (info/warning).
 */
export type ArticleBlock =
  | { kind: 'h2'; text: string }
  | { kind: 'p'; html: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'callout'; variant: 'info' | 'warning'; html: string }

/**
 * Long-form editorial content (TOFU/MOFU guides that capture informational
 * search intent). Not to be confused with `Guide` above which represents a
 * tour guide person. Articles live at /guides/[slug] and ship JSON-LD
 * `Article` schema for generative-engine-optimization.
 */
export type Article = {
  /** URL slug — same across locales so hreflang alternates line up */
  slug: string
  /** yyyy-MM-dd, last revision (drives JSON-LD dateModified) */
  lastUpdated: string
  /** Display title (H1, meta title, JSON-LD headline) */
  title: string
  /** 150-160 char SEO description used in generateMetadata */
  metaDescription: string
  /** One-sentence summary shown on index card (40-100 chars) */
  excerpt: string
  /** Which tour this article drives toward (for related-tour CTA). Optional. */
  relatedTourSlug?: 'el-yunque' | 'catamaran' | 'salsa'
  /** Body blocks — first block is typically a `p` intro, followed by h2+p/ul groups */
  body: ArticleBlock[]
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

/**
 * Legal page content. Sections are numbered 1, 2, 3 and contain a mix of
 * paragraph and list blocks. Inline markup (strong, em, a href, code) is
 * permitted in block strings and rendered with a controlled HTML injection
 * in the page template. Content is author-controlled (lib/cms/data/legal.*),
 * never user input. Anything richer belongs in MDX, not here.
 */
export type LegalBlock =
  | { kind: 'p'; html: string }
  | { kind: 'ul'; items: string[] }

export type LegalSection = {
  n: string
  title: string
  blocks: LegalBlock[]
}

export type LegalPage = {
  /** yyyy-MM-dd, last revision */
  lastUpdated: string
  /** Pre-sections intro paragraph, inline markup permitted */
  introHtml: string
  sections: LegalSection[]
  /** SEO description (80-160 chars) used in generateMetadata */
  metaDescription: string
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
    /**
     * TripAdvisor rankings, primary first. Casa Venturas is listed under
     * two distinct TripAdvisor categories (Tours + Transportation).
     * rankings[0] = primary badge (used in Hero, page stats, meta, JSON-LD).
     * rankings[1..N] = secondary mentions (footer, about-us style copy).
     */
    rankings: [string, ...string[]]
    url: string
  }
  social: {
    youtube: string
  }
  featured: Array<{ name: string; url?: string; note?: string }>
}
