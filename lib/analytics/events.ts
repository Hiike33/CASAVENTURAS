/**
 * Typed GA4 event helpers for Casa Venturas.
 *
 * Wraps `window.gtag('event', ...)` with strict types so that :
 *   • Event names are stable strings (no typo across call sites).
 *   • Param shapes match what GA4 expects (snake_case, value+currency
 *     for monetary events, item array for `purchase`).
 *   • Calls are safe in SSR (window undefined) and when the user has
 *     declined consent (gtag is loaded but `analytics_storage='denied'` —
 *     gtag handles the queue/discard internally).
 *   • Calls are no-op in dev/local without NEXT_PUBLIC_GA_MEASUREMENT_ID
 *     (no gtag function on window → silent return).
 *
 * Event taxonomy mapped to the Casa Venturas booking funnel :
 *   1. tour_view         — landed on /tours/[slug]
 *   2. date_selected     — picked a date in BookingSidebar
 *   3. begin_checkout    — clicked "Confirm booking" → CheckoutPanel opens
 *   4. promo_applied     — typed a promo code (any outcome)
 *   5. booking_attempt   — clicked "Pay & confirm" (Stripe tokenized)
 *   6. purchase          — Bokun confirmed the booking (GA4 standard event)
 *
 * Why `purchase` (vs `booking_confirmed`) : GA4 has built-in e-commerce
 * reports (Conversion rate, Avg order value, Abandoned checkout) that
 * fire automatically when the spec'd `purchase` event lands. Using the
 * standard event name is free reporting infrastructure.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Internal emitter — exposed for tests. Production code calls the typed
 * `track.*` helpers below; the emitter handles SSR / no-gtag safely.
 */
export function emit(name: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('event', name, params ?? {})
}

export const track = {
  tourView(params: { tourSlug: string; locale: string }): void {
    emit('tour_view', {
      tour_slug: params.tourSlug,
      locale: params.locale,
    })
  },

  dateSelected(params: { tourSlug: string; daysAhead: number }): void {
    emit('date_selected', {
      tour_slug: params.tourSlug,
      days_ahead: params.daysAhead,
    })
  },

  beginCheckout(params: {
    tourSlug: string
    value: number
    currency?: string
  }): void {
    emit('begin_checkout', {
      tour_slug: params.tourSlug,
      value: params.value,
      currency: params.currency ?? 'USD',
    })
  },

  promoApplied(params: {
    code: string
    valid: boolean
    reason?: string
    discount?: number
  }): void {
    emit('promo_applied', {
      promo_code: params.code,
      valid: params.valid,
      ...(params.reason !== undefined && { reason: params.reason }),
      ...(params.discount !== undefined && { discount: params.discount }),
    })
  },

  bookingAttempt(params: {
    tourSlug: string
    value: number
    currency?: string
  }): void {
    emit('booking_attempt', {
      tour_slug: params.tourSlug,
      value: params.value,
      currency: params.currency ?? 'USD',
    })
  },

  /**
   * GA4 standard `purchase` event — feeds the built-in e-commerce reports.
   * `transaction_id` MUST be unique per booking (we use Bokun's
   * confirmationCode, e.g. "CV-A1B2C3").
   */
  purchase(params: {
    tourSlug: string
    value: number
    currency?: string
    confirmationCode: string
  }): void {
    emit('purchase', {
      transaction_id: params.confirmationCode,
      value: params.value,
      currency: params.currency ?? 'USD',
      items: [
        {
          item_id: params.tourSlug,
          item_name: params.tourSlug,
          price: params.value,
          quantity: 1,
        },
      ],
    })
  },
}
