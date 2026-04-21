import type { FAQ } from '@/lib/types/cms'
import { tours } from './tours.en.ts'

const priceOf = (slug: string): number => {
  const t = tours.find(x => x.slug === slug)
  if (!t) throw new Error(`tour not found: ${slug}`)
  return t.price
}

/**
 * General FAQs — shown on home/contact, apply to the brand overall.
 * Sourced from site policy (free cancellation, small groups, direct booking)
 * and from Puerto Rico travel concerns identified in competitor research
 * (passport, hurricane season, mosquitoes, safety, tipping, languages).
 *
 * Each FAQ has a stable `id` used by Cavi's intent matcher to reference the
 * answer without duplicating text. Never rename an id once shipped.
 */
export const generalFaqs: FAQ[] = [
  {
    id: 'gen-location',
    question: 'Where is Casa Venturas based?',
    answer: 'Casa Venturas is based in San Juan, Puerto Rico. We offer three core experiences: an El Yunque rainforest day tour, a private catamaran charter to Vieques (marina in Humacao), and sunset salsa classes on a San Juan rooftop.',
  },
  {
    id: 'gen-group-size',
    question: 'How small are the groups?',
    answer: 'El Yunque groups are capped at 13 guests. The catamaran is a private charter for up to 12 guests, your group only. Salsa classes are open-group with flexible capacity.',
  },
  {
    id: 'gen-pickup',
    question: 'Do you include hotel pickup?',
    answer: `Yes for the El Yunque tour. Pickup from any San Juan-area hotel is included in the $${priceOf('el-yunque')}/person price. Catamaran pickup from San Juan can be arranged on request (the marina is 1h from San Juan in Humacao). Salsa is self-access at the Casa Santurce rooftop in San Juan.`,
  },
  {
    id: 'gen-cancellation',
    question: 'What is your cancellation policy?',
    answer: 'Free cancellation up to 24 hours before your tour. Booking is direct through our website, no OTA commission fees.',
  },
  {
    id: 'gen-tripadvisor',
    question: 'Is Casa Venturas on TripAdvisor?',
    answer: 'Yes. Casa Venturas is rated 5.0 stars with 1,458 reviews and ranked #10 of 152 tours in San Juan on TripAdvisor. We are also featured in KAYAK Travel Guides.',
  },
  {
    id: 'gen-how-to-book',
    question: 'How do I book?',
    answer: 'Book directly on casaventuras.com, fill the reservation form on the page of the tour you want. You can also email micasaventuras@gmail.com or WhatsApp +1 929 372 4529. Direct bookings save you up to 25% versus OTAs like Viator.',
  },
  {
    id: 'gen-passport',
    question: 'Do I need a passport to visit Puerto Rico?',
    answer: 'No. Puerto Rico is a U.S. territory, so U.S. citizens only need a valid photo ID like a driver\'s license or state ID. International visitors follow the same rules as entering the U.S. mainland.',
  },
  {
    id: 'gen-best-time',
    question: 'When is the best time to visit Puerto Rico?',
    answer: 'December through April is the dry, cooler season and the sweet spot for El Yunque and the catamaran. The hurricane season runs June to November (peak in September), but tours run daily unless a named storm is active. We offer flexible rebooking if weather flips.',
  },
  {
    id: 'gen-mosquitoes',
    question: 'What about mosquitoes and Zika?',
    answer: 'Mosquitoes are most active August to October. Zika transmission in Puerto Rico has been near zero for years now. Bring DEET repellent for El Yunque (it\'s a jungle, so you\'ll want it). The catamaran and salsa rooftop are breezy, low-mosquito environments.',
  },
  {
    id: 'gen-safety',
    question: 'Is San Juan safe for tourists?',
    answer: 'Yes, very safe. Tourist areas like Old San Juan, Condado, and Isla Verde are well-patrolled. Just use normal common sense: don\'t leave valuables in your rental car, and grab an Uber after dark. Our El Yunque tour picks you up at your hotel and drops you back, so you\'re never navigating anywhere alone.',
  },
  {
    id: 'gen-languages',
    question: 'Do your guides speak English and Spanish?',
    answer: 'Yes, fully bilingual. All tours default to English, and guides switch to Spanish, French, or Portuguese on request. Zoe teaches salsa with counts in both English and Spanish.',
  },
  {
    id: 'gen-tipping',
    question: 'How does tipping work?',
    answer: 'Tipping is appreciated but never required. Guests who want to tip usually leave 10 to 15% of the tour price, or $5 to $10 per person, in cash at the end of the tour. Guides and drivers split tips evenly.',
  },
]

/**
 * Per-tour FAQs — rendered as FAQPage JSON-LD on each tour page.
 * Facts sourced from lib/cms/data/tours.ts (highlights + whatToBring) and
 * from competitor research on common concerns per experience type.
 */
export const tourFaqs: Record<string, FAQ[]> = {
  'el-yunque': [
    {
      id: 'ey-fitness',
      question: 'What fitness level is the El Yunque tour?',
      answer: 'Moderate. The tour involves a hike through muddy jungle paths to reach the river and natural waterslide. You can opt out of the cliff jumps (5, 10–15, or 20 ft) at any point. No pressure to jump from anywhere you are not comfortable.',
    },
    {
      id: 'ey-what-to-bring',
      question: 'What should I bring for El Yunque?',
      answer: 'Water shoes or old sneakers (they will get wet and muddy), a change of clothes and a dry bag, a waterproof phone case, sunscreen, water, and a small snack. A life vest is available if you are not a confident swimmer.',
    },
    {
      id: 'ey-kids-seniors',
      question: 'Is El Yunque suitable for kids and seniors?',
      answer: 'Yes. We have guided groups with 5-year-olds and senior guests. Our guides adapt the pace and choose spots with easier access. Reviews mention families with kids aged 5 and seniors feeling safe and included.',
    },
    {
      id: 'ey-duration',
      question: 'How long is the El Yunque tour?',
      answer: '6 to 7 hours total including hotel pickup from San Juan, the guided jungle hike with ecosystem commentary, time at the natural waterslide and cliff jumps, and return transport.',
    },
    {
      id: 'ey-why-us',
      question: 'What makes El Yunque special vs. other rainforest tours?',
      answer: 'El Yunque is the only tropical rainforest in the US National Forest system. It hosts unique species like the Puerto Rican parrot, the coquí frog, and 300-year-old trees. We take you to hidden spots (natural waterslide, cliff jumps, rope swing) that large bus tours never reach.',
    },
    {
      id: 'ey-reservation-gov',
      question: 'Do I need a Recreation.gov reservation?',
      answer: 'No. When you book with us, all park permits and entry fees are included. Solo rental-car visitors have to pre-book their own slot on recreation.gov, but that does not apply to guided tours.',
    },
    {
      id: 'ey-cliff-age',
      question: 'Is there a minimum age for the cliff jumps?',
      answer: 'There is no minimum because jumps are always optional. The ledges go from 5 ft (kids can do it, parents alongside) up to 20 ft (adults only). You can skip any or all. We have had 5-year-olds jump the low one and grandparents watch from the river bank. Zero pressure either way.',
    },
    {
      id: 'ey-rain',
      question: 'What happens if it rains?',
      answer: 'Light rain is part of the rainforest experience. Waterfalls flow stronger and the forest comes alive. If a serious storm or flash flood warning is issued we reschedule at no charge, or refund you in full.',
    },
  ],
  catamaran: [
    {
      id: 'cat-departure',
      question: 'Where does the catamaran depart from?',
      answer: 'From Plaza Mayor, Palmas del Mar marina in Humacao, approximately 1 hour drive from San Juan. Private transport from San Juan is available on request when you book.',
    },
    {
      id: 'cat-capacity',
      question: 'How many people can the catamaran fit?',
      answer: 'Up to 12 guests. The boat is a 40-foot Bali catamaran chartered exclusively for your group, no strangers on board.',
    },
    {
      id: 'cat-inclusions',
      question: `What is included in the $${priceOf('catamaran')} per person price?`,
      answer: 'Full-day private charter, sailing to Punta Arena beach in Vieques, swimming, snorkeling, and paddleboarding equipment, open bar (rum, beer, soft drinks), lunch served on deck, sunset return sail, and professional crew with captain.',
    },
    {
      id: 'cat-weather',
      question: 'Does the catamaran run in bad weather?',
      answer: 'The tour runs regardless of cloudy or rainy weather unless sea conditions are unsafe (storm warning, high swell). If the captain cancels for safety, you get a full refund or free rebooking.',
    },
    {
      id: 'cat-seasickness',
      question: 'Will I get seasick?',
      answer: 'The route from Humacao to Vieques is protected by Vieques Sound, so the water is calmer than open Caribbean. If you are prone to motion sickness, take Dramamine 30 minutes before boarding. Ginger candy helps too, and our crew usually has some on board.',
    },
    {
      id: 'cat-bathroom',
      question: 'Is there a bathroom on board?',
      answer: 'Yes. The 40-ft Bali catamaran has an enclosed private head (marine bathroom) below deck.',
    },
    {
      id: 'cat-age-min',
      question: 'What is the minimum age for the catamaran?',
      answer: 'Kids of any walking age are welcome. For safety and insurance reasons, infants under 2 are not allowed on board. Life jackets in kids\' sizes are provided.',
    },
    {
      id: 'cat-alcohol-minors',
      question: 'Is the open bar available to minors?',
      answer: 'No. The open bar with rum, beer, and wine is strictly 21 and over, following Puerto Rico law. Minors get unlimited soft drinks, juices, and water, all included in the tour price.',
    },
  ],
  salsa: [
    {
      id: 'sal-experience',
      question: 'Do I need dance experience for the salsa class?',
      answer: 'No. Instructor Zoe specializes in absolute beginners. The class teaches you the first steps from scratch in a fun, social atmosphere, nothing like a formal studio class.',
    },
    {
      id: 'sal-location',
      question: 'Where is the salsa class held?',
      answer: 'On the rooftop of Casa Santurce at 1050 Calle Marianna, 00907 San Juan. Panoramic city view, warm Caribbean breeze, sunset light. It is a 20-minute Uber or taxi ride from Old San Juan.',
    },
    {
      id: 'sal-time',
      question: 'What time does the salsa class start?',
      answer: 'Every day at 5 PM. The class lasts 2 to 3 hours and includes a free Piña Colada at the end while the sun sets over the San Juan skyline.',
    },
    {
      id: 'sal-wear',
      question: 'What should I wear for salsa?',
      answer: 'Comfortable shoes you can move in, sneakers are fine, no heels required. Casual clothes. Arrive 10 minutes early.',
    },
    {
      id: 'sal-partner',
      question: 'Do I need to bring a dance partner?',
      answer: 'No. Most of our students come solo or with friends. Zoe rotates pairings during the class so everyone dances with multiple people. Couples who want to stay paired just let Zoe know.',
    },
    {
      id: 'sal-accessibility',
      question: 'Is the rooftop wheelchair-accessible?',
      answer: 'The rooftop is reached by an elevator plus one flight of stairs. If you have mobility concerns, contact us before booking. We can arrange a ground-level venue alternative for the same night.',
    },
    {
      id: 'sal-private',
      question: 'What if I cannot make the 5 PM daily class?',
      answer: 'Private lessons at flexible times are available on request. Same price, same instructor, and we can arrange a different venue if needed. Email us to set it up.',
    },
  ],
}

/**
 * Flat lookup of all FAQs by id. Used by Cavi intent matcher to resolve a
 * keyword-matched intent to its canonical FAQ answer. Built at module load.
 */
export const faqById: Record<string, FAQ> = Object.fromEntries(
  [
    ...generalFaqs,
    ...Object.values(tourFaqs).flat(),
  ].map(f => [f.id, f]),
)
