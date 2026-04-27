import { siteConfig } from '@/lib/cms/data/site-config.en'
import type { Tour, FAQ, Guide, Article } from '@/lib/types/cms'
import type { Locale } from '@/i18n/routing'

// Maps i18n locale → schema.org BCP-47 language code. Puerto Rico uses es-PR
// (not es-ES) for geographic accuracy; FR visitors are primarily from France
// so fr-FR is the closest match.
const SCHEMA_LANG: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-PR',
  fr: 'fr-FR',
}

type Props = {
  /** Current page locale — drives inLanguage on all JSON-LD nodes. */
  locale?: Locale
  /** When provided, emits a TouristTrip schema for this tour. */
  tour?: Tour
  /** Emit Person[] schema (GEO / E-E-A-T lever). */
  guides?: Guide[]
  /** Emit FAQPage schema (GEO P0 lever). */
  faqs?: FAQ[]
  /** Emit ItemList wrapping the provided tours (home page catalog view). */
  itemList?: Tour[]
  /** Emit WebSite + SearchAction schema; use ONCE at root (layout or home). */
  website?: boolean
  /** Emit a generic WebPage node for legal/informational pages. */
  webPage?: { path: string; name: string; dateModified?: string }
  /** Emit an Article node for /guides/[slug] TOFU editorial pages. */
  article?: { article: Article; path: string }
}

const ORG_ID = `${siteConfig.url}/#organization`
const WEBSITE_ID = `${siteConfig.url}/#website`

function buildOrganization() {
  return {
    '@type': 'TravelAgency',
    '@id': ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/icon.png`,
    },
    image: `${siteConfig.url}${siteConfig.ogImage}`,
    description: siteConfig.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Juan',
      addressRegion: 'PR',
      addressCountry: 'US',
    },
    // Geo coordinates of the Casa Venturas operating base in Santurce —
    // helps Google Maps + "near me" local search match queries like
    // "tour operator in San Juan Puerto Rico" to a precise pin.
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 18.4527,
      longitude: -66.0723,
    },
    hasMap: 'https://www.google.com/maps/place/San+Juan,+Puerto+Rico/',
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Puerto Rico' },
      { '@type': 'Place', name: 'El Yunque National Forest' },
      { '@type': 'Place', name: 'Vieques' },
      { '@type': 'Place', name: 'San Juan' },
    ],
    knowsAbout: [
      'El Yunque National Forest',
      'Puerto Rican rainforest ecology',
      'Vieques sailing',
      'Punta Arena beach',
      'San Juan salsa culture',
      'Small-group tourism',
      'Puerto Rican wildlife (coquí, parrots)',
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: siteConfig.tripAdvisor.rating,
      reviewCount: siteConfig.tripAdvisor.reviews,
      bestRating: 5,
      worstRating: 1,
    },
    sameAs: [siteConfig.tripAdvisor.url, siteConfig.social.youtube],
  }
}

function buildTouristTrip(tour: Tour, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${siteConfig.url}/tours/${tour.slug}#tour`,
    name: tour.name,
    description: tour.description,
    touristType: tour.category,
    inLanguage: SCHEMA_LANG[locale],
    url: `${siteConfig.url}/tours/${tour.slug}`,
    image: tour.photos.map(p => siteConfig.url.replace(/\/$/, '') + p),
    offers: {
      '@type': 'Offer',
      price: tour.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: `${siteConfig.url}/tours/${tour.slug}`,
    },
    provider: { '@id': ORG_ID },
    // Itinerary = the experience location (rainforest, beach, rooftop) so
    // search engines can plot the trip on a map. Geo coordinates come
    // from `tour.geo` (lib/cms/data/tours.en.ts) — when present they
    // upgrade the Place node from a name-only stub to a precisely
    // geocoded entity, which is what unlocks "things to do near …" local
    // pack inclusion. `address` is the meeting point (where the customer
    // shows up); for tours without a separate address we synthesise from
    // the heroTag so the Place still has a non-empty `name`.
    itinerary: {
      '@type': 'Place',
      name: tour.address ?? tour.heroTag,
      ...(tour.address && { address: tour.address }),
      ...(tour.geo && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: tour.geo.latitude,
          longitude: tour.geo.longitude,
        },
      }),
    },
    ...(tour.groupSize.match(/\d+/) && {
      maximumAttendeeCapacity: Number(tour.groupSize.match(/\d+/)![0]),
    }),
  }
}

function buildFaqPage(faqs: FAQ[], locale: Locale, tour?: Tour) {
  // @id makes the FAQPage node referenceable from other schema graphs
  // (e.g., a TouristTrip's mainEntityOfPage). On tour pages the @id is
  // anchored to the tour ; on the home page it lives at site root.
  const id = tour
    ? `${siteConfig.url}/tours/${tour.slug}#faq`
    : `${siteConfig.url}/#faq`
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': id,
    inLanguage: SCHEMA_LANG[locale],
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

function buildGuidesGraph(guides: Guide[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': guides.map(g => ({
      '@type': 'Person',
      name: g.name,
      jobTitle: g.jobTitle,
      worksFor: { '@id': ORG_ID },
      ...(g.description && { description: g.description }),
    })),
  }
}

function buildItemList(tours: Tour[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${siteConfig.url}/#experiences`,
    name: 'Casa Venturas experiences',
    itemListElement: tours.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'TouristTrip',
        '@id': `${siteConfig.url}/tours/${t.slug}#tour`,
        name: t.name,
        url: `${siteConfig.url}/tours/${t.slug}`,
      },
    })),
  }
}

function buildWebSite(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.tagline,
    inLanguage: SCHEMA_LANG[locale],
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

function buildWebPage(wp: { path: string; name: string; dateModified?: string }, locale: Locale) {
  const url = `${siteConfig.url}${wp.path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: wp.name,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: SCHEMA_LANG[locale],
    ...(wp.dateModified && { dateModified: wp.dateModified }),
  }
}

function buildArticle(article: Article, path: string, locale: Locale) {
  const url = `${siteConfig.url}${path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.lastUpdated,
    dateModified: article.lastUpdated,
    inLanguage: SCHEMA_LANG[locale],
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: url,
    url,
  }
}

function Script({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const props = { type: 'application/ld+json' as const, dangerouslySetInnerHTML: { __html: json } }
  return <script {...props} />
}

export default function SchemaOrg({ locale = 'en', tour, guides, faqs, itemList, website, webPage, article }: Props) {
  return (
    <>
      <Script data={tour ? buildTouristTrip(tour, locale) : { '@context': 'https://schema.org', ...buildOrganization() }} />
      {website && <Script data={buildWebSite(locale)} />}
      {webPage && <Script data={buildWebPage(webPage, locale)} />}
      {faqs && faqs.length > 0 && <Script data={buildFaqPage(faqs, locale, tour)} />}
      {guides && guides.length > 0 && <Script data={buildGuidesGraph(guides)} />}
      {itemList && itemList.length > 0 && <Script data={buildItemList(itemList)} />}
      {article && <Script data={buildArticle(article.article, article.path, locale)} />}
    </>
  )
}
