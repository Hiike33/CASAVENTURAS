import type { SiteConfig } from '@/lib/types/cms'

/**
 * Casa Venturas site configuration — static data.
 * Contains brand info, contact, social links, and TripAdvisor social proof.
 * When migrating to a headless CMS, replace this object.
 */
export const siteConfig: SiteConfig = {
  name: 'Casa Venturas',
  tagline: 'Real Puerto Rico. Small groups. Local guides.',
  email: 'micasaventuras@gmail.com',
  phone: '+1 929 372 4529',
  whatsapp: 'https://wa.me/19293724529',
  location: 'San Juan, Puerto Rico',
  hours: 'Mon–Sun · 7:00 AM – 8:00 PM AST',
  url: 'https://casaventuras.com',
  ogImage: '/images/og/casa-ventura-adventures.png',
  tripAdvisor: {
    rating: 5.0,
    reviews: 1458,
    rankings: [
      '#10 of 152 Tours in San Juan',
      '#1 of 99 Transportation Services in San Juan',
    ],
    url: 'https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  social: {
    youtube: 'https://www.youtube.com/watch?v=_qz8fcMaor8',
  },
  featured: [
    { name: 'KAYAK Travel Guides', url: 'https://www.kayak.com/San-Juan.12552.guide' },
    { name: 'Viator', note: 'Likely to sell out' },
    { name: 'TripAdvisor', note: '#10 of 152 Tours · #1 of 99 Transportation · 5.0★ · 1,458 reviews' },
  ],
}
