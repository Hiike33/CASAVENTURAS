export type BokunAvailability = {
  productId: number
  date: string
  startTime?: string
  availabilityCount: number
  soldOut: boolean
  pricesByCategory?: Record<string, number>
  minParticipants?: number
  maxParticipants?: number
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
