import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import './globals.css'
import BokunScript from '@/components/BokunScript'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import CookieConsentBanner from '@/components/CookieConsentBanner'

// Locale-aware root layout. Every UI route is wrapped here, so <html lang>,
// metadata, OpenGraph locale, and the messages dictionary all flow from the
// [locale] URL segment. API routes at app/api/* bypass this layout entirely.

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

// SEO metadata per locale. Keys live in messages/{locale}.json under the
// "Metadata" namespace so the client can translate titles too if needed.
const TITLE = {
  en: 'Casa Venturas, Puerto Rico Experiences',
  es: 'Casa Venturas, experiencias en Puerto Rico',
  fr: 'Casa Venturas, expériences à Porto Rico',
} as const

const DESCRIPTION = {
  en: 'Small-group tours in Puerto Rico. El Yunque rainforest, private catamaran to Vieques, sunset salsa. #10 of 152 Tours & #1 of 99 Transportation in San Juan, 5.0★, 1,458 reviews.',
  es: 'Tours en grupos pequeños en Puerto Rico. Bosque El Yunque, catamarán privado a Vieques, salsa al atardecer. #10 de 152 Tours y #1 de 99 Transporte en San Juan, 5.0★, 1,458 reseñas.',
  fr: 'Tours en petits groupes à Porto Rico. Forêt d\'El Yunque, catamaran privé pour Vieques, salsa au coucher du soleil. #10 sur 152 Tours & #1 sur 99 Transport à San Juan, 5.0★, 1 458 avis.',
} as const

const OG_LOCALE = { en: 'en_US', es: 'es_PR', fr: 'fr_FR' } as const

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const loc = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  const title = TITLE[loc]
  const description = DESCRIPTION[loc]

  return {
    metadataBase: new URL('https://casaventuras.com'),
    title: { default: title, template: '%s · Casa Venturas' },
    description,
    keywords: 'El Yunque tour San Juan, Puerto Rico adventure tour, private catamaran Vieques, salsa lesson San Juan, small group tour Puerto Rico',
    openGraph: {
      title,
      description: '#10 of 152 Tours · #1 of 99 Transportation in San Juan · 5.0★ · 1,458 reviews',
      url: 'https://casaventuras.com',
      siteName: 'Casa Venturas',
      locale: OG_LOCALE[loc],
      type: 'website',
      // 1200×630 (1.91:1) is the standard landscape ratio expected by
      // Facebook/Twitter/LinkedIn/iMessage. Portrait OG images (what we had
      // before, 1200×1600) get cropped hard in most previews.
      images: [{ url: '/images/og/og-1200x630.jpg', width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: '#10 of 152 Tours · #1 of 99 Transportation in San Juan · 5.0★',
      images: ['/images/og/og-1200x630.jpg'],
    },
    alternates: {
      canonical: loc === 'en' ? '/' : `/${loc}`,
      languages: {
        en: '/',
        es: '/es',
        fr: '/fr',
        'x-default': '/',
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body>
        <div className="scroll-progress-bar" aria-hidden />
        <NextIntlClientProvider>
          {children}
          <CookieConsentBanner />
        </NextIntlClientProvider>
        <BokunScript />
        <GoogleAnalytics />
      </body>
    </html>
  )
}
