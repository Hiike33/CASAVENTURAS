/**
 * Pure helpers for the /api/bokun/promo/validate route — extracted so
 * tests can exercise them without loading Next.js runtime (NextRequest/
 * NextResponse).
 *
 *  - validatePromoRequestBody : shape & range validation
 *  - rateLimitHit / clearRateLimiter : in-memory sliding-window limiter
 *
 * The limiter is intentionally simple. A single Next.js instance can
 * rely on this Map without coordination. Horizontal scale would need
 * an external store (Redis, DO, etc.) but is out of scope for this site.
 */

export type PromoRequestBody = {
  productId: number
  startTimeId: number
  rateId: number
  date: string
  passengersByCategory: Record<number, number>
  subtotal: number
  currency?: string
  promoCode: string
}

/**
 * Validate the client body. Returns null on success, or a short error
 * message on failure (mirrors the style in checkout/submit/route.ts).
 */
export function validatePromoRequestBody(b: Partial<PromoRequestBody>): string | null {
  if (!b.productId || !Number.isFinite(b.productId)) return 'productId required'
  if (!b.startTimeId || !Number.isFinite(b.startTimeId)) return 'startTimeId required'
  if (!b.rateId || !Number.isFinite(b.rateId)) return 'rateId required'
  if (!b.date || !/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return 'date (yyyy-MM-dd) required'
  if (!b.passengersByCategory || typeof b.passengersByCategory !== 'object') {
    return 'passengersByCategory required'
  }
  if (!Number.isFinite(b.subtotal) || (b.subtotal as number) < 0) return 'subtotal required (>= 0)'
  if (typeof b.promoCode !== 'string' || !b.promoCode.trim()) return 'promoCode required'
  return null
}

// ─── Rate limiter (in-memory sliding window) ──────────────────────────────

export const RATE_LIMIT_MAX = 5
export const RATE_LIMIT_WINDOW_MS = 60_000

const rateLimiter = new Map<string, number[]>()

export function rateLimitHit(ip: string, now: number = Date.now()): boolean {
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = (rateLimiter.get(ip) ?? []).filter(t => t > windowStart)
  if (hits.length >= RATE_LIMIT_MAX) {
    rateLimiter.set(ip, hits)
    return true
  }
  hits.push(now)
  rateLimiter.set(ip, hits)
  return false
}

/** Test-only: reset the limiter between cases. */
export function clearRateLimiter(): void {
  rateLimiter.clear()
}

/** Test-only: seed the limiter (for window-expiration tests). */
export function seedRateLimiter(ip: string, timestamps: number[]): void {
  rateLimiter.set(ip, timestamps)
}
