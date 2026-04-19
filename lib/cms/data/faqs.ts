import type { FAQ } from '@/lib/types/cms'
import { tours } from './tours.ts'

const priceOf = (slug: string): number => {
  const t = tours.find(x => x.slug === slug)
  if (!t) throw new Error(`tour not found: ${slug}`)
  return t.price
}

/**
 * General FAQs — shown on home/contact, apply to the brand overall.
 * Sourced from site policy (free cancellation, small groups, direct booking).
 */
export const generalFaqs: FAQ[] = [
  {
    question: 'Where is Casa Venturas based?',
    answer: 'Casa Venturas is based in San Juan, Puerto Rico. We offer three core experiences: an El Yunque rainforest day tour, a private catamaran charter to Vieques (marina in Humacao), and sunset salsa classes on a San Juan rooftop.',
  },
  {
    question: 'How small are the groups?',
    answer: 'El Yunque groups are capped at 13 guests. The catamaran is a private charter for up to 12 guests — your group only. Salsa classes are open-group with flexible capacity.',
  },
  {
    question: 'Do you include hotel pickup?',
    answer: `Yes for the El Yunque tour — pickup from any San Juan-area hotel is included in the $${priceOf('el-yunque')}/person price. Catamaran pickup from San Juan can be arranged on request (the marina is 1h from San Juan in Humacao). Salsa is self-access at the Casa Santurce rooftop in San Juan.`,
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Free cancellation up to 24 hours before your tour. Booking is direct through our website — no OTA commission fees.',
  },
  {
    question: 'Is Casa Venturas on TripAdvisor?',
    answer: 'Yes. Casa Venturas is rated 5.0 stars with 1,458 reviews and ranked #10 of 152 tours in San Juan on TripAdvisor. We are also featured in KAYAK Travel Guides.',
  },
  {
    question: 'How do I book?',
    answer: 'Book directly on casaventuras.com — fill the reservation form on the page of the tour you want. You can also email micasaventuras@gmail.com or WhatsApp +1 929 372 4529. Direct bookings save you up to 25% versus OTAs like Viator.',
  },
]

/**
 * Per-tour FAQs — rendered as FAQPage JSON-LD on each tour page.
 * Facts sourced from lib/cms/data/tours.ts (highlights + whatToBring).
 */
export const tourFaqs: Record<string, FAQ[]> = {
  'el-yunque': [
    {
      question: 'What fitness level is the El Yunque tour?',
      answer: 'Moderate. The tour involves a hike through muddy jungle paths to reach the river and natural waterslide. You can opt out of the cliff jumps (5, 10–15, or 20 ft) at any point — there is no pressure to jump from anywhere you are not comfortable.',
    },
    {
      question: 'What should I bring for El Yunque?',
      answer: 'Water shoes or old sneakers (they will get wet and muddy), a change of clothes and a dry bag, a waterproof phone case, sunscreen, water, and a small snack. A life vest is available if you are not a confident swimmer.',
    },
    {
      question: 'Is El Yunque suitable for kids and seniors?',
      answer: 'Yes — we have guided groups with 5-year-olds and senior guests. Our guides adapt the pace and choose spots with easier access. Reviews mention families with kids aged 5 and seniors feeling safe and included.',
    },
    {
      question: 'How long is the El Yunque tour?',
      answer: '6 to 7 hours total including hotel pickup from San Juan, the guided jungle hike with ecosystem commentary, time at the natural waterslide and cliff jumps, and return transport.',
    },
    {
      question: 'What makes El Yunque special vs. other rainforest tours?',
      answer: 'El Yunque is the only tropical rainforest in the US National Forest system. It hosts unique species like the Puerto Rican parrot, the coquí frog, and 300-year-old trees. We take you to hidden spots (natural waterslide, cliff jumps, rope swing) that large bus tours never reach.',
    },
  ],
  catamaran: [
    {
      question: 'Where does the catamaran depart from?',
      answer: 'From Plaza Mayor, Palmas del Mar marina in Humacao — approximately 1 hour drive from San Juan. Private transport from San Juan is available on request when you book.',
    },
    {
      question: 'How many people can the catamaran fit?',
      answer: 'Up to 12 guests. The boat is a 40-foot Bali catamaran chartered exclusively for your group — no strangers on board.',
    },
    {
      question: `What is included in the $${priceOf('catamaran')} per person price?`,
      answer: 'Full-day private charter, sailing to Punta Arena beach in Vieques, swimming, snorkeling, and paddleboarding equipment, open bar (rum, beer, soft drinks), lunch served on deck, sunset return sail, and professional crew with captain.',
    },
    {
      question: 'Does the catamaran run in bad weather?',
      answer: 'The tour runs regardless of cloudy or rainy weather unless sea conditions are unsafe (storm warning, high swell). If the captain cancels for safety, you get a full refund or free rebooking.',
    },
  ],
  salsa: [
    {
      question: 'Do I need dance experience for the salsa class?',
      answer: 'No. Instructor Zoe specializes in absolute beginners. The class teaches you the first steps from scratch in a fun, social atmosphere — nothing like a formal studio class.',
    },
    {
      question: 'Where is the salsa class held?',
      answer: 'On the rooftop of Casa Santurce at 1050 Calle Marianna, 00907 San Juan. Panoramic city view, warm Caribbean breeze, sunset light. It is a 20-minute Uber or taxi ride from Old San Juan.',
    },
    {
      question: 'What time does the salsa class start?',
      answer: 'Every day at 6 PM. The class lasts 2 to 3 hours and includes a free Piña Colada at the end while the sun sets over the San Juan skyline.',
    },
    {
      question: 'What should I wear for salsa?',
      answer: 'Comfortable shoes you can move in — sneakers are fine, no heels required. Casual clothes. Arrive 10 minutes early.',
    },
  ],
}
