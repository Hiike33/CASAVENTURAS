import type { Tour } from '@/lib/types/cms'

/**
 * Casa Venturas tours — static data.
 *
 * This is the "local" data source consumed by LocalAdapter.
 * When migrating to a headless CMS (Sanity, Contentful, Payload, etc.),
 * replace this array with an adapter that fetches from the CMS API and
 * maps the response to the Tour type in lib/types/cms.ts.
 */

// Bókun product IDs are exposed via NEXT_PUBLIC_ env vars so both server
// components (for `/api/bokun/*` calls) and client components (for widget
// URLs) resolve the same value at build time.
const BOKUN_PRODUCT_ID: Record<string, number | undefined> = {
  'el-yunque': toNum(process.env.NEXT_PUBLIC_BOKUN_PRODUCT_EL_YUNQUE),
  catamaran: toNum(process.env.NEXT_PUBLIC_BOKUN_PRODUCT_CATAMARAN),
  salsa: toNum(process.env.NEXT_PUBLIC_BOKUN_PRODUCT_SALSA),
}

function toNum(v: string | undefined): number | undefined {
  if (!v) return undefined
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

const rawTours: Tour[] = [
  {
    slug: 'el-yunque',
    name: 'El Yunque Vivid Day Tour',
    shortName: 'El Yunque',
    category: 'Rainforest · Adventure',
    tagColor: '#72D4A0',
    thumbBg: '#111E14',
    price: 89,
    priceNote: 'per person · transport incl.',
    duration: '6–7h',
    groupSize: '≤ 13',
    level: 'Moderate',
    description: 'Natural waterslides, cliff jumps from 5 to 20ft, rope swings, and muddy jungle trails. Your local guide brings the rainforest alive with history and hidden spots. Transport from your hotel included.',
    highlights: [
      'Natural waterslide carved into the rainforest river',
      'Cliff jumps from 5, 10–15, and 20ft into crystal-clear water',
      'Rope swing over the river',
      'Guided jungle hike with ecosystem commentary',
      'Return transport to your San Juan hotel',
      'Photos shared by your guide at end of tour',
    ],
    whatToBring: [
      'Water shoes or old sneakers (they will get wet and muddy)',
      'Change of clothes and a dry bag',
      'Waterproof phone case for photos in the water',
      'Sunscreen, water, and a small snack',
      'Life vest available if you\'re not a confident swimmer',
    ],
    heroTag: 'Rainforest · El Yunque National Forest',
    photos: [
      '/images/tours/el-yunque/dsc8267-hd.jpg',
      '/images/tours/el-yunque/dsc8278-hd.jpg',
      '/images/tours/el-yunque/dsc8314-hd.jpg',
      '/images/tours/el-yunque/dsc8332-hd.jpg',
      '/images/tours/el-yunque/dsc8354-hd.jpg',
      '/images/tours/el-yunque/dsc8453-hd.jpg',
      '/images/tours/el-yunque/dsc8463-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/el-yunque/dsc8314-hd.jpg',
      '/images/tours/el-yunque/dsc8278-hd.jpg',
      '/images/tours/el-yunque/dsc8267-hd.jpg',
      '/images/tours/el-yunque/dsc8332-hd.jpg',
      '/images/tours/el-yunque/dsc8354-hd.jpg',
      '/images/tours/el-yunque/dsc8453-hd.jpg',
      '/images/tours/el-yunque/dsc8463-hd.jpg',
    ],
    video: 'https://www.youtube.com/watch?v=_qz8fcMaor8',
    tripAdvisorProductUrl: 'https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    slug: 'catamaran',
    name: 'Private Catamaran to Vieques',
    shortName: 'Catamaran',
    category: 'Sailing · Luxury',
    tagColor: '#72C4D4',
    thumbBg: '#0A141E',
    price: 249,
    pricedPerPerson: false,
    priceNote: 'for up to 12 guests',
    duration: 'Full day',
    groupSize: '≤ 12',
    level: undefined,
    includes: 'Private charter',
    description: 'Step aboard a 40-foot Bali catamaran and enjoy an unforgettable private sailing experience through the pristine waters of Vieques. Designed for comfort, space, and style — exclusively for your group.',
    highlights: [
      'Full-day private charter on a 40-ft Bali catamaran',
      'Sailing to Punta Arena — one of Vieques\' most secluded beaches',
      'Swimming, snorkeling, and paddleboarding equipment',
      'Sunset return sail to Humacao marina',
      'Professional crew and captain',
    ],
    whatToBring: [
      'Sunscreen, hat, towel, change of clothes',
      'Swimwear and non-marking shoes for the boat',
    ],
    address: 'Plaza Mayor, Palmas del Mar, Humacao',
    heroTag: 'Sailing · Punta Arena, Vieques',
    photos: [
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    tripAdvisorProductUrl: 'https://www.tripadvisor.com/AttractionProductReview-g147319-d34092341-Private_Luxury_Sailing_Catamaran_Day_to_Vieques-Puerto_Rico.html',
  },
  {
    slug: 'salsa',
    name: 'Sunset Salsa Rooftop',
    shortName: 'Salsa',
    category: 'Culture · Dance',
    tagColor: '#D4A872',
    thumbBg: '#1E0E08',
    price: 65,
    priceNote: 'per person · Piña Colada incl.',
    duration: '2–3h',
    groupSize: 'Open',
    level: 'Beginner',
    includes: 'Piña Colada',
    description: 'Instructor Zoe teaches absolute beginners on the rooftop of Casa Santurce at sunset. Fun social atmosphere, free Piña Colada, panoramic city view. Todo suena mejor con salsa.',
    highlights: [
      '2–3h salsa initiation with instructor Zoe',
      'Free Piña Colada at the end of the class',
      'Sunset view from the Casa Santurce rooftop',
      'Fun social atmosphere — meet other travelers',
      'No experience needed',
    ],
    whatToBring: [
      'Comfortable shoes you can move in',
      'Arrive 10 minutes early',
    ],
    address: '1050 Calle Marianna, 00907 San Juan — Casa Santurce Rooftop',
    heroTag: 'Dance · Casa Santurce Rooftop',
    photos: [
      '/images/tours/salsa/salsapic7-hd.jpg',
      '/images/tours/salsa/salsapic5-hd.jpg',
      '/images/tours/salsa/salsapic6-hd.jpg',
      '/images/tours/salsa/salsapic3-hd.jpg',
      '/images/tours/salsa/salsapic8-hd.jpg',
      '/images/tours/salsa/salsasite1-hd.jpg',
      '/images/tours/salsa/salsasite2-hd.jpg',
      '/images/tours/salsa/salsasite3-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/salsa/salsapic3-hd.jpg',
      '/images/tours/salsa/salsapic5-hd.jpg',
      '/images/tours/salsa/salsapic6-hd.jpg',
      '/images/tours/salsa/salsapic7-hd.jpg',
      '/images/tours/salsa/salsapic8-hd.jpg',
      '/images/tours/salsa/salsasite1-hd.jpg',
      '/images/tours/salsa/salsasite2-hd.jpg',
      '/images/tours/salsa/salsasite3-hd.jpg',
    ],
  },
]

export const tours: Tour[] = rawTours.map(t => ({
  ...t,
  bokunProductId: BOKUN_PRODUCT_ID[t.slug],
}))
