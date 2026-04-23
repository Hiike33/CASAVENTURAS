import type { MetadataRoute } from 'next'
import { tours, siteConfig } from '@/lib/tours'
import { articles } from '@/lib/cms/data/articles.en'
import { routing } from '@/i18n/routing'

// Multilingual sitemap. Each URL is emitted once per locale with an
// `alternates.languages` block so Google understands the three versions
// are translations of the same content, not duplicates. The default
// locale (EN) keeps the bare URL without a prefix.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const base = siteConfig.url

  const pathFor = (locale: string, path: string) =>
    locale === routing.defaultLocale ? `${base}${path}` : `${base}/${locale}${path}`

  const alternatesFor = (path: string) =>
    Object.fromEntries(routing.locales.map(l => [l, pathFor(l, path)]))

  const paths: Array<{ path: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/cookies', changeFrequency: 'yearly', priority: 0.2 },
    ...tours.map(t => ({ path: `/tours/${t.slug}`, changeFrequency: 'weekly' as const, priority: 0.9 })),
    { path: '/guides', changeFrequency: 'monthly', priority: 0.6 },
    ...articles.map(a => ({ path: `/guides/${a.slug}`, changeFrequency: 'monthly' as const, priority: 0.7 })),
  ]

  return routing.locales.flatMap(locale =>
    paths.map(({ path, changeFrequency, priority }) => ({
      url: pathFor(locale, path),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages: alternatesFor(path) },
    })),
  )
}
