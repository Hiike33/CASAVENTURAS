import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/tours'

// AI + SEO crawlers welcomed explicitly. They are already allowed by the
// catch-all '*' rule, but naming them is a trust signal : "this site is
// generative-engine-optimized by design". Removing any of these names
// would IMPLICITLY keep them allowed — use an empty disallow to opt-out.
const AI_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
]

const SEO_CRAWLERS = ['Googlebot', 'Bingbot', 'DuckDuckBot']

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_CRAWLERS, allow: '/' },
      { userAgent: SEO_CRAWLERS, allow: '/' },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          // Internal routes kept out of the index — they exist in dev/
          // preview flow but are not user-facing destinations.
          '/preview-checkout/',
          '/gallery-preview',
          '/footer-preview',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
