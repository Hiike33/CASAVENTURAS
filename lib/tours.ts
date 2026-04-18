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

export const tours: Tour[] = [
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
    priceNote: 'per person · all-inclusive',
    duration: 'Full day',
    groupSize: '≤ 12',
    level: undefined,
    includes: 'Lunch + bar',
    description: 'Step aboard a 40-foot Bali catamaran and enjoy an unforgettable private sailing experience through the pristine waters of Vieques. Designed for comfort, space, and style — exclusively for your group.',
    highlights: [
      'Full-day private charter on a 40-ft Bali catamaran',
      'Sailing to Punta Arena — one of Vieques\' most secluded beaches',
      'Swimming, snorkeling, and paddleboarding equipment',
      'Open bar (rum, beer, soft drinks)',
      'Lunch served on deck',
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
      '/images/tours/catamaran/bathroom-hd.jpg',
      '/images/tours/catamaran/customer1-hd.jpg',
      '/images/tours/catamaran/customer2-hd.jpg',
    ],
    galleryPhotos: [
      '/images/tours/catamaran/bali2-hd.jpg',
      '/images/tours/catamaran/bali1-hd.jpg',
      '/images/tours/catamaran/bali3-hd.jpg',
      '/images/tours/catamaran/bali4-hd.jpg',
      '/images/tours/catamaran/bali5-hd.jpg',
      '/images/tours/catamaran/bathroom-hd.jpg',
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
    time: '6PM daily',
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

export type Review = {
  text: string
  author: string
  tour: string
  guide?: string
  title: string
  rating: 5
  url: string
}

export const reviews: Review[] = [
  {
    text: 'Eliu made sure everyone felt safe and included — from our 5-year-old to my senior mom. The rope swing, cliff jump, waterslide — unforgettable.',
    author: 'Verified guest',
    tour: 'El Yunque Tour',
    guide: 'Eliu',
    title: 'El Yunque',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r816053718-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: 'Juelz and Paul made us feel like family. The cliff jumps, rope swing — I\'ll talk about this trip for a lifetime. Best tour in Puerto Rico.',
    author: 'smithcastel',
    tour: 'El Yunque Tour',
    guide: 'Juelz + Paul',
    title: 'Juelz Is The Best!',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r938035224-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: "Catherine 'La Taína' — one of the best guides I've ever had anywhere. The rope swing — she did it three times. Spectacular day.",
    author: 'MRicci12',
    tour: 'El Yunque Tour',
    guide: 'Catherine "La Taína"',
    title: 'La Taina is La BEST',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r981315597-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: 'Small group, 13 people max — we could actually connect with the guide and the jungle. Other tours had big buses. This felt personal.',
    author: 'Verified guest',
    tour: 'Small Group Tour',
    title: '10/10 Experience',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r934681345-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: 'Justice and Rodriguez were so knowledgeable about the jungle and Puerto Rican culture. Made the hike fun for first-timers.',
    author: 'julierF3212SJ',
    tour: 'El Yunque Tour',
    guide: 'Justice + Rodriguez',
    title: 'Fun El Yunque Experience!',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r870333443-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: 'Kendra helped our 8-year-old the whole hike, explaining animals and plants. Amazing for all ages. Book this tour.',
    author: 'eeeybakid',
    tour: 'Family Group',
    guide: 'Kendra',
    title: 'Amazing day at El Yunque',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r870758643-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: 'A cool experience through El Yunque with a knowledgeable guide. The waterslide and cliff jumps are as fun as advertised.',
    author: 'Verified guest',
    tour: 'El Yunque Tour',
    title: 'Cool Experience',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r928466547-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  {
    text: 'Absolutely 5 stars. Our guide repped the natives, knew all the locals, worked together to make the day safe and amazing.',
    author: 'Verified guest',
    tour: 'El Yunque Tour',
    title: '5 stars',
    rating: 5,
    url: 'https://www.tripadvisor.com/ShowUserReviews-g147320-d21156167-r939980883-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
]

export const siteConfig = {
  name: 'Casa Venturas',
  tagline: 'Real Puerto Rico. Small groups. Local guides.',
  email: 'micasaventuras@gmail.com',
  phone: '+1 929 372 4529',
  whatsapp: 'https://wa.me/19293724529',
  location: 'San Juan, Puerto Rico',
  hours: 'Mon–Sun · 7:00 AM – 8:00 PM AST',
  url: 'https://micasaventuras.com',
  ogImage: '/images/og/casa-ventura-adventures.png',
  tripAdvisor: {
    rating: 5.0,
    reviews: 1458,
    ranking: '#10 of 152 tours in San Juan',
    url: 'https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  social: {
    youtube: 'https://www.youtube.com/watch?v=_qz8fcMaor8',
  },
  featured: [
    { name: 'KAYAK Travel Guides', url: 'https://www.kayak.com/San-Juan.12552.guide' },
    { name: 'Viator', note: 'Likely to sell out' },
    { name: 'TripAdvisor', note: '#10 of 152 in San Juan · 5.0★ · 1,458 reviews' },
  ],
}
