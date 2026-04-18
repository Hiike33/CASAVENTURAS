import type { MetadataRoute } from 'next'
import { tours, siteConfig } from '@/lib/tours'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${siteConfig.url}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${siteConfig.url}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    ...tours.map(t => ({
      url: `${siteConfig.url}/tours/${t.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ]
}
