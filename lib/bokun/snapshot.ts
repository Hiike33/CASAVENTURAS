/**
 * Bókun snapshot — Phase 1 build-time enrichment.
 *
 * The CMS (lib/cms/data/tours.{en,es,fr}.ts) holds translated narrative
 * content (name, description, highlights) plus numeric values the CMS
 * owns (price, duration). Bókun is the authoritative source for
 * commerce data: cancellation policy, pricing categories, start times,
 * and price structure.
 *
 * scripts/fetch-bokun-snapshot.ts queries Bókun at build time and writes
 * lib/cms/data/bokun-snapshot.json. The LocalAdapter imports that file
 * (webpack inlines it) and attaches every matching snapshot entry under
 * tour.bokunSnapshot via enrichToursWithSnapshot. Pages SSG with the
 * merged values, no runtime Bókun calls, no network dependency at
 * serve time. A fresh deploy = a fresh snapshot.
 *
 * Phase 1 scope: attach snapshot, consumers read ONLY cancellationHours
 * and startTimes. Price override is deferred — Bókun exposes multiple
 * rates (OTA/retail) whose mapping needs vendor validation before we
 * display an auto-fetched number that could contradict the public
 * widget. See decisions.md D-020 for the full staleness policy.
 *
 * Every function here is pure and fs/network-free so the unit tests in
 * snapshot.test.ts can exercise them without mocking.
 */

import type { Tour } from '../types/cms.ts'

export type BokunPricingCategory = {
  id: number
  title: string
  ticketCategory: string
  minAge?: number
  maxAge?: number
}

/** Raw rate-level pricing copied through from Bókun /activity + /availabilities */
export type BokunRatePrice = {
  activityRateId: number
  rateTitle?: string
  pricedPerPerson?: boolean
  /** Present when pricedPerPerson=true; one entry per pricingCategory id */
  pricePerCategoryUnit?: Array<{
    categoryId: number
    amount: number
    currency: string
  }>
  /** Present when pricedPerPerson=false; flat fee per booking (private charters) */
  pricePerBooking?: { amount: number; currency: string }
}

export type BokunTourSnapshot = {
  /** Bókun numeric experience id, echoed for traceability */
  productId: number
  /**
   * Hours before tour start at which the first non-zero cancellation
   * charge kicks in. Derived from cancellationPolicy.penaltyRules, so
   * "Free cancellation up to X hours" = X. Undefined when Bókun exposes
   * no penalty rule (tour is either fully flexible or fully non-refundable).
   */
  cancellationHours?: number
  /** Distinct HH:mm start times observed in the near-term availability window, e.g. ["08:00", "09:30"] */
  startTimes?: string[]
  /**
   * Days of week on which Bokun exposes availability. Stored as 3-letter
   * English abbreviations ("Mon".."Sun") derived from availability.date so
   * the UI can map to any locale without parsing localized strings. Order
   * is canonical: Mon first, Sun last.
   */
  daysOfWeek?: string[]
  /** Full pricing category list from Bókun (ADULT, CHILD, INFANT, …) */
  pricingCategories?: BokunPricingCategory[]
  /**
   * Rate-level pricing carried through for future display work.
   * Not consumed in Phase 1 — vendor mapping (OTA vs retail) must be
   * confirmed before we trust any single rate as the canonical price.
   */
  ratePrices?: BokunRatePrice[]
  /** ISO 8601 UTC — when the snapshot was fetched. Lets us warn on staleness. */
  fetchedAt: string
}

/** On-disk snapshot file: map slug → snapshot. */
export type BokunSnapshotMap = Record<string, BokunTourSnapshot>

/**
 * Bokun expresses cancellation as "within X hours of start, charge Y%".
 * "Free cancellation up to X hours" is the smallest cutoff at which a
 * non-zero charge kicks in — cancel earlier than that and you pay 0.
 * Example rules: [{24h, 100%}, {24000h, 0%}] → threshold = 24.
 */
export function deriveCancellationHours(
  rules: ReadonlyArray<{ cutoffHours: number; charge: number }> | undefined,
): number | undefined {
  if (!rules || rules.length === 0) return undefined
  const charging = rules.filter(r => r.charge > 0)
  if (charging.length === 0) return undefined
  return Math.min(...charging.map(r => r.cutoffHours))
}

/**
 * Format a Bokun startTime ("HH:mm") as a user-facing 12-hour string.
 * "08:00" → "8 AM" · "10:00" → "10 AM" · "17:00" → "5 PM" · "12:30" →
 * "12:30 PM". Noon is PM, midnight is AM. Returns undefined for inputs
 * that are not HH:mm so callers can safely chain with a fallback.
 *
 * We deliberately do not append "daily" or any locale-dependent suffix ,
 * the UI composes that itself (or omits it) based on its own copy deck.
 */
export function formatStartTime(hhmm: string | undefined): string | undefined {
  if (!hhmm) return undefined
  const parts = hhmm.split(':')
  if (parts.length !== 2) return undefined
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return undefined
  }
  const suffix = h >= 12 ? 'PM' : 'AM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

function hhmmToMinutes(hhmm: string): number | null {
  const parts = hhmm.split(':')
  if (parts.length !== 2) return null
  const h = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isInteger(h) || !Number.isInteger(m)) return null
  return h * 60 + m
}

/**
 * Aggregate a list of Bokun HH:mm start times into one readable string.
 *
 *   []                                 -> undefined
 *   ["17:00"]                          -> "5 PM"
 *   ["08:00","08:10","08:20","08:30"]  -> "8–8:30 AM"     (span <= 60 min)
 *   ["09:00","14:00"]                  -> "9 AM, 2 PM"    (spread > 60 min)
 *
 * The range form is useful for El Yunque where 4 staggered bus pickups
 * within a 30-minute window are really one morning departure. The list
 * form would surface afternoon-plus-morning departures, if a tour ever
 * exposed them , currently none of the 3 products do, but it is cheap
 * insurance against future schedule changes.
 */
export function formatStartTimeRange(times: ReadonlyArray<string> | undefined): string | undefined {
  if (!times || times.length === 0) return undefined
  const sorted = [...times].sort()
  const formatted = sorted.map(formatStartTime).filter((s): s is string => Boolean(s))
  if (formatted.length === 0) return undefined
  if (formatted.length === 1) return formatted[0]

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const firstMin = hhmmToMinutes(first)
  const lastMin = hhmmToMinutes(last)
  if (firstMin === null || lastMin === null) return formatted.join(', ')

  if (lastMin - firstMin <= 60) {
    // Same am/pm window , drop the redundant suffix on the left side.
    const lastFull = formatted[formatted.length - 1]
    const lastSuffix = lastFull.endsWith('AM') ? 'AM' : lastFull.endsWith('PM') ? 'PM' : ''
    const firstFull = formatted[0]
    const firstSameSuffix = firstFull.endsWith(lastSuffix)
    const firstTrimmed = firstSameSuffix ? firstFull.replace(/\s?(AM|PM)$/, '') : firstFull
    return `${firstTrimmed}–${lastFull}`
  }
  return formatted.join(', ')
}

/**
 * Resolve the canonical display time for a Tour. Reads EXCLUSIVELY from
 * the Bokun snapshot (D-020 policy: Bokun is the source, always, and
 * stays dynamic). Returns undefined when Bokun exposes no time for this
 * slug , the UI hides the surface in that case rather than falling back
 * to a stale CMS string. If you see an empty schedule line, the fix is
 * to refresh the snapshot (npm run bokun:snapshot), not to edit the CMS.
 */
export function getDisplayTime(tour: Tour): string | undefined {
  return formatStartTimeRange(tour.bokunSnapshot?.startTimes)
}

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const FULL_DAY: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
}

/**
 * Human-readable schedule label for the days Bokun has availability on.
 *   7 days → "Daily"
 *   1 day  → full name, e.g. "Friday"
 *   subset → comma-separated 3-letter list, e.g. "Mon, Wed, Fri"
 *   none   → undefined (the UI should hide the label surface)
 *
 * English-only output by design: "Fri" / "Daily" read well for a PR tour
 * site that's mostly Anglo-tourist anyway, and it dodges a translation
 * dictionary per day name. If we later need FR/ES, swap this for a
 * locale-aware variant , the BookingSidebar date picker is the
 * authoritative availability surface in any case.
 */
export function getDisplayDaysLabel(tour: Tour): string | undefined {
  const days = tour.bokunSnapshot?.daysOfWeek
  if (!days || days.length === 0) return undefined
  if (days.length >= 7) return 'Daily'
  if (days.length === 1) return FULL_DAY[days[0]] ?? days[0]
  // Reorder per canonical Mon..Sun sequence before joining.
  const sorted = DAY_ORDER.filter(d => days.includes(d))
  return sorted.join(', ')
}

/**
 * Attach a snapshot to each matching tour without mutating the price.
 * Pure function: same inputs → same outputs, no fs, no network. Tours
 * without a matching snapshot pass through unchanged.
 *
 * Why we do NOT override tour.price here:
 *   Live Bókun inspection showed defaultPrice is null on this vendor's
 *   availabilities; prices live in pricesByRate[] and can be net/OTA
 *   rates that differ from the retail widget price. Displaying the raw
 *   API number would mislead customers. The raw data is still carried
 *   under bokunSnapshot.ratePrices for a future price-aware commit once
 *   the vendor confirms which rate row is the retail source of truth.
 */
export function enrichToursWithSnapshot(
  tours: ReadonlyArray<Tour>,
  snapshot: BokunSnapshotMap,
): Tour[] {
  return tours.map(t => {
    const snap = snapshot[t.slug]
    if (!snap) return t
    return { ...t, bokunSnapshot: snap }
  })
}
