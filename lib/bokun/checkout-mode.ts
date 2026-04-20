// Single source of truth for the custom checkout rollout state.
//
//   disabled  — production default. BookingSidebar keeps the .bokunButton
//               that opens the hosted Bókun modal. CheckoutPanel is not
//               rendered. Zero risk.
//   dev-mock  — CheckoutPanel is shown but the submit route returns a fake
//               success after latency simulation. Used in dev + preview
//               environments to validate the full UX without creating real
//               bookings in the client's Bókun account.
//   live      — CheckoutPanel + real Stripe Elements + real Bokun submit.
//               Only flipped when end-to-end QA has passed.
//
// IMPORTANT: the flag is read from BOTH env vars so server and client stay
// coherent. Invalid values fail safe to `disabled`.

export type CheckoutMode = 'disabled' | 'dev-mock' | 'live'

const VALID: ReadonlySet<CheckoutMode> = new Set(['disabled', 'dev-mock', 'live'])

export function resolveCheckoutMode(raw: string | undefined | null): CheckoutMode {
  if (raw && VALID.has(raw as CheckoutMode)) return raw as CheckoutMode
  return 'disabled'
}

/**
 * Client-side resolved mode — uses NEXT_PUBLIC_* so the value is inlined at
 * build time and available to React components.
 */
export const CLIENT_CHECKOUT_MODE: CheckoutMode = resolveCheckoutMode(
  process.env.NEXT_PUBLIC_BOKUN_CHECKOUT_MODE,
)

/**
 * Server-side resolved mode — read inside API route handlers only. Falls
 * back to the client mode if the server-only var is not set (acceptable
 * for dev; in prod the two should always be aligned).
 */
export function resolveServerCheckoutMode(): CheckoutMode {
  const serverVal = process.env.BOKUN_CHECKOUT_MODE
  if (serverVal) return resolveCheckoutMode(serverVal)
  return CLIENT_CHECKOUT_MODE
}
