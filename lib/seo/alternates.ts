import type { Metadata } from 'next'
import { routing, type Locale } from '@/i18n/routing'

/**
 * Build a Next.js Metadata `alternates` block with the full hreflang map.
 *
 * Why this exists: Next.js 15 replaces (not deep-merges) the `alternates`
 * object when a page provides its own generateMetadata. If a child page
 * returns only `{ canonical }`, the parent layout's `languages` map is
 * dropped and no <link rel="alternate" hreflang="..."> tags render, which
 * breaks international SEO. All pages should emit hreflang.
 *
 *   path:          "/", "/contact", "/privacy", "/tours/el-yunque", …
 *                  (no trailing slash, always starts with "/")
 *   currentLocale: the page's active locale, drives the canonical URL
 *
 * Output:
 *   canonical is per-locale (EN at /path, others at /{loc}/path).
 *   languages lists every locale + an x-default pointing at EN.
 *
 * Example: localizedAlternates('/privacy', 'es') → {
 *   canonical:  'https://casaventuras.com/es/privacy',
 *   languages:  { en: '/privacy', es: '/es/privacy', fr: '/fr/privacy', 'x-default': '/privacy' }
 * }
 */
export function localizedAlternates(
  path: string,
  currentLocale: Locale,
  baseUrl = 'https://casaventuras.com',
): NonNullable<Metadata['alternates']> {
  const normalized = path === '/' ? '' : path
  const pathFor = (loc: Locale) =>
    loc === routing.defaultLocale
      ? normalized || '/'
      : `/${loc}${normalized}`

  const languages: Record<string, string> = { 'x-default': normalized || '/' }
  for (const loc of routing.locales) {
    languages[loc] = pathFor(loc)
  }

  return {
    canonical: `${baseUrl}${pathFor(currentLocale)}`,
    languages,
  }
}
