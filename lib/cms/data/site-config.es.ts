import type { SiteConfig } from '@/lib/types/cms'

/**
 * Configuración del sitio Casa Venturas — variante ES.
 * Paridad de claves con site-config.en.ts.
 * Valores técnicos (email, teléfono, URLs, WhatsApp) se conservan sin traducir.
 */
export const siteConfig: SiteConfig = {
  name: 'Casa Venturas',
  tagline: 'Puerto Rico auténtico. Grupos pequeños. Guías locales.',
  email: 'micasaventuras@gmail.com',
  phone: '+1 929 372 4529',
  whatsapp: 'https://wa.me/19293724529',
  location: 'San Juan, Puerto Rico',
  hours: 'Lun–Dom · 7:00 AM – 8:00 PM AST',
  url: 'https://casaventuras.com',
  ogImage: '/images/og/casa-ventura-adventures.png',
  tripAdvisor: {
    rating: 5.0,
    reviews: 1458,
    ranking: '#10 de 152 tours en San Juan',
    url: 'https://www.tripadvisor.com/Attraction_Review-g147320-d21156167-Reviews-Casa_Venturas-San_Juan_Puerto_Rico.html',
  },
  social: {
    youtube: 'https://www.youtube.com/watch?v=_qz8fcMaor8',
  },
  featured: [
    { name: 'KAYAK Travel Guides', url: 'https://www.kayak.com/San-Juan.12552.guide' },
    { name: 'Viator', note: 'Suele agotarse' },
    { name: 'TripAdvisor', note: '#10 de 152 en San Juan · 5.0★ · 1,458 reseñas' },
  ],
}
