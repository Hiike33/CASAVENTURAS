'use client'

import { useEffect } from 'react'
import { track } from '@/lib/analytics/events'

/**
 * Tiny client-only component that fires a `tour_view` event once after
 * hydration. Used by Server Component tour pages
 * (app/[locale]/tours/[slug]/page.tsx) which cannot call gtag directly.
 *
 * Mounting once per page = one event per page-view, deduplicated by
 * React's effect lifecycle. Strict-mode double-effect in dev is
 * irrelevant: events fire to GA which already deduplicates by
 * client_id + ga_session_id within a few seconds.
 */
export default function TourViewTracker({
  tourSlug,
  locale,
}: {
  tourSlug: string
  locale: string
}) {
  useEffect(() => {
    track.tourView({ tourSlug, locale })
  }, [tourSlug, locale])
  return null
}
