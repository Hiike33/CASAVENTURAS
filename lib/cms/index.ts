import type { CMSAdapter } from './adapter'
import { LocalAdapter } from './local-adapter'

/**
 * CMS entry point.
 *
 * Server Components can do:
 *   import { getCMS } from '@/lib/cms'
 *   const cms = getCMS()
 *   const tours = await cms.getTours()
 *
 * Today: returns LocalAdapter (static data from lib/cms/data/).
 * Tomorrow: switch on process.env.CMS_SOURCE to return SanityAdapter etc.
 *
 * Keep this factory sync — env var read is cheap and deterministic per process.
 */
let instance: CMSAdapter | null = null

export function getCMS(): CMSAdapter {
  if (instance) return instance
  // Future: if (process.env.CMS_SOURCE === 'sanity') instance = new SanityAdapter()
  instance = new LocalAdapter()
  return instance
}

// Re-export types for convenience — consumers can
//   import type { Tour, Review, SiteConfig, FAQ, Guide } from '@/lib/cms'
export type { Tour, Review, SiteConfig, FAQ, Guide } from '@/lib/types/cms'
export type { CMSAdapter } from './adapter'
