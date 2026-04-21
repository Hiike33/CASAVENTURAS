import type { Tour, SiteConfig, LegalPage } from '@/lib/types/cms'
import type { Locale } from '@/i18n/routing'
import { enrichToursWithSnapshot, type BokunSnapshotMap } from '@/lib/bokun/snapshot'

import { tours as toursEn } from './data/tours.en'
import { tours as toursEs } from './data/tours.es'
import { tours as toursFr } from './data/tours.fr'
import { siteConfig as configEn } from './data/site-config.en'
import { siteConfig as configEs } from './data/site-config.es'
import { siteConfig as configFr } from './data/site-config.fr'
import * as legalEn from './data/legal.en'
import * as legalEs from './data/legal.es'
import * as legalFr from './data/legal.fr'
import bokunSnapshot from './data/bokun-snapshot.json'

// Synchronous client-safe accessors. Mirror of LocalAdapter but without the
// Promise wrapper, so client components (Nav, StickyMobileCTA, forms) can
// pick the right locale data during render without effects or suspense.
// Static imports keep Next.js tree-shaking per route.
//
// Bokun snapshot enrichment must happen HERE too, not just in LocalAdapter,
// otherwise client components read tours without the live schedule data.

const TOURS: Record<Locale, Tour[]> = {
  en: enrichToursWithSnapshot(toursEn, bokunSnapshot as BokunSnapshotMap),
  es: enrichToursWithSnapshot(toursEs, bokunSnapshot as BokunSnapshotMap),
  fr: enrichToursWithSnapshot(toursFr, bokunSnapshot as BokunSnapshotMap),
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

export type LegalSlug = 'privacy' | 'terms' | 'cookies'

const LEGAL: Record<Locale, { privacy: LegalPage; terms: LegalPage; cookies: LegalPage }> = {
  en: { privacy: legalEn.privacy, terms: legalEn.terms, cookies: legalEn.cookies },
  es: { privacy: legalEs.privacy, terms: legalEs.terms, cookies: legalEs.cookies },
  fr: { privacy: legalFr.privacy, terms: legalFr.terms, cookies: legalFr.cookies },
}

export function legalFor(locale: Locale, slug: LegalSlug): LegalPage {
  return (LEGAL[locale] ?? LEGAL.en)[slug]
}
