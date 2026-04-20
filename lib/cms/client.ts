import type { Tour, SiteConfig } from '@/lib/types/cms'
import type { Locale } from '@/i18n/routing'

import { tours as toursEn } from './data/tours.en'
import { tours as toursEs } from './data/tours.es'
import { tours as toursFr } from './data/tours.fr'
import { siteConfig as configEn } from './data/site-config.en'
import { siteConfig as configEs } from './data/site-config.es'
import { siteConfig as configFr } from './data/site-config.fr'

// Synchronous client-safe accessors. Mirror of LocalAdapter but without the
// Promise wrapper, so client components (Nav, StickyMobileCTA, forms) can
// pick the right locale data during render without effects or suspense.
// Static imports keep Next.js tree-shaking per route.

const TOURS: Record<Locale, Tour[]> = {
  en: toursEn,
  es: toursEs,
  fr: toursFr,
}

const CONFIG: Record<Locale, SiteConfig> = {
  en: configEn,
  es: configEs,
  fr: configFr,
}

export function toursFor(locale: Locale): Tour[] {
  return TOURS[locale] ?? TOURS.en
}

export function siteConfigFor(locale: Locale): SiteConfig {
  return CONFIG[locale] ?? CONFIG.en
}
