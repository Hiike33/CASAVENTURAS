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
