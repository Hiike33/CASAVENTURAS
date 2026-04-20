import { siteConfig } from '@/lib/cms/data/site-config'
import type { Tour, FAQ, Guide } from '@/lib/types/cms'

type Props = {
  /** When provided, emits a TouristTrip schema for this tour. */
  tour?: Tour
  /** Emit Person[] schema (GEO / E-E-A-T lever). */
  guides?: Guide[]
  /** Emit FAQPage schema (GEO P0 lever). */
  faqs?: FAQ[]
  /** Emit ItemList wrapping the provided tours (home page catalog view). */
  itemList?: Tour[]
  /** Emit WebSite + SearchAction schema — use ONCE at root (layout or home). */
  website?: boolean
  /** Emit a generic WebPage node for legal/informational pages. */
  webPage?: { path: string; name: string; dateModified?: string }
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

function buildTouristTrip(tour: Tour) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${siteConfig.url}/tours/${tour.slug}#tour`,
    name: tour.name,
    description: tour.description,
    touristType: tour.category,
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
    ...(tour.address && {
      itinerary: { '@type': 'Place', name: tour.address, address: tour.address },
    }),
    ...(tour.groupSize.match(/\d+/) && {
      maximumAttendeeCapacity: Number(tour.groupSize.match(/\d+/)![0]),
    }),
  }
}

function buildFaqPage(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
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

function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.tagline,
    inLanguage: 'en-US',
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

function buildWebPage(wp: { path: string; name: string; dateModified?: string }) {
  const url = `${siteConfig.url}${wp.path}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: wp.name,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en-US',
    ...(wp.dateModified && { dateModified: wp.dateModified }),
  }
}

function Script({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  const props = { type: 'application/ld+json' as const, dangerouslySetInnerHTML: { __html: json } }
  return <script {...props} />
}

export default function SchemaOrg({ tour, guides, faqs, itemList, website, webPage }: Props) {
  return (
    <>
      <Script data={tour ? buildTouristTrip(tour) : { '@context': 'https://schema.org', ...buildOrganization() }} />
      {website && <Script data={buildWebSite()} />}
      {webPage && <Script data={buildWebPage(webPage)} />}
      {faqs && faqs.length > 0 && <Script data={buildFaqPage(faqs)} />}
      {guides && guides.length > 0 && <Script data={buildGuidesGraph(guides)} />}
      {itemList && itemList.length > 0 && <Script data={buildItemList(itemList)} />}
    </>
  )
}
