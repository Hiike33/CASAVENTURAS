// Real shape verified against live Bókun API (GET /activity.json/{id}/availabilities)
// on 2026-04-19. Only the fields we actually consume are typed; Bókun returns
// more (rates, pickupAllotment, comboStartTimes, flags, etc.) — pass them
// through as `unknown` if they ever become useful.

export type BokunAvailability = {
  id: string
  activityId: number
  startTime?: string
  startTimeLabel?: string
  /** Unix timestamp in milliseconds (midnight UTC of the tour day) */
  date: number
  localizedDate?: string
  availabilityCount: number
  bookedParticipants?: number
  minParticipants?: number
  unlimitedAvailability?: boolean
  unavailable?: boolean
  soldOut: boolean
  defaultPrice?: { amount: number; currency: string }
  pricesByCategory?: Record<string, { amount: number; currency: string }>
  /**
   * Bokun-issued default rate id for this slot. Used by the checkout to
   * match pricesByRate entries. Always present on active slots — optional
   * here for defensive typing.
   */
  defaultRateId?: number
  /**
   * The slot's start time id (the numeric handle the checkout route
   * requires in POST /cart.json/{sid}/activity). Raw passthrough from
   * Bokun; always present on active slots.
   */
  startTimeId?: number
  /**
   * Runtime per-rate prices. Same data shape the snapshot script
   * consumes at build time — see scripts/fetch-bokun-snapshot.ts. The
   * checkout UI reads this when available to show prices that reflect
   * Bokun *now* rather than the ≤6h-stale snapshot.
   */
  pricesByRate?: Array<{
    activityRateId: number
    pricePerCategoryUnit?: Array<{
      id: number
      amount: { amount: number; currency: string }
    }>
    pricePerBooking?: { amount: number; currency: string }
  }>
}

export type BokunErrorResponse = {
  ok: false
  error: string
  status?: number
  detail?: unknown
}

export type BokunAvailabilityResponse =
  | { ok: true; availabilities: BokunAvailability[] }
  | BokunErrorResponse
