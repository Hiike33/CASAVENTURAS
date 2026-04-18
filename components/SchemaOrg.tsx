import { siteConfig, type Tour } from '@/lib/tours'

type Props = { tour?: Tour }

const organization = {
  '@type': 'TravelAgency',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  url: siteConfig.url,
  email: siteConfig.email,
  telephone: siteConfig.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Juan',
    addressRegion: 'PR',
    addressCountry: 'US',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: siteConfig.tripAdvisor.rating,
    reviewCount: siteConfig.tripAdvisor.reviews,
    bestRating: 5,
    worstRating: 1,
  },
  sameAs: [siteConfig.tripAdvisor.url, siteConfig.social.youtube],
}

function buildTouristTrip(tour: Tour) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
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
    provider: organization,
    ...(tour.address && {
      itinerary: { '@type': 'Place', name: tour.address, address: tour.address },
    }),
    ...(tour.groupSize.match(/\d+/) && {
      maximumAttendeeCapacity: Number(tour.groupSize.match(/\d+/)![0]),
    }),
  }
}

export default function SchemaOrg({ tour }: Props) {
  const data = tour
    ? buildTouristTrip(tour)
    : { '@context': 'https://schema.org', ...organization }
  const json = JSON.stringify(data)
  const props = { type: 'application/ld+json' as const, dangerouslySetInnerHTML: { __html: json } }
  return <script {...props} />
}
