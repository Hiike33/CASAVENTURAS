/**
 * Cookie consent state — pure helpers + localStorage shim.
 *
 * The site uses Google Consent Mode v2 (gtag('consent', 'default',
 * { analytics_storage: 'denied' })) so the GA tag loads but never sets
 * cookies until the user explicitly opts in via CookieConsentBanner.
 *
 * State machine :
 *   • 'pending' — first visit, no decision recorded; banner is shown
 *   • 'granted' — user clicked Accept; gtag('consent','update',granted)
 *   • 'denied'  — user clicked Decline; gtag stays denied; banner hidden
 *
 * Persistence : localStorage under STORAGE_KEY. We deliberately avoid
 * a 1st-party cookie because (a) GDPR is simpler with no cookies of
 * our own, (b) localStorage isn't sent on every request, lower overhead.
 *
 * The helpers are designed to be safe in SSR (where window is undefined):
 * read returns 'pending' on the server so the banner UI defers to the
 * client useEffect.
 */

export type ConsentState = 'pending' | 'granted' | 'denied'

export const STORAGE_KEY = 'cv-analytics-consent'

const VALID = new Set<ConsentState>(['pending', 'granted', 'denied'])

/**
 * Read the persisted consent decision. Returns 'pending' on:
 *   • SSR (no window)
 *   • localStorage access denied (incognito strict mode, etc.)
 *   • absent or malformed value
 */
export function readConsent(): ConsentState {
  if (typeof window === 'undefined') return 'pending'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && VALID.has(raw as ConsentState) && raw !== 'pending') {
      return raw as ConsentState
    }
  } catch {
    // localStorage unavailable — treat as pending, ask again next visit
  }
  return 'pending'
}

/**
 * Persist a consent decision. No-op when window is unavailable or
 * localStorage throws (incognito quotas). Always callable from event
 * handlers without try/catch wrapping at the call site.
 */
export function writeConsent(state: 'granted' | 'denied'): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, state)
  } catch {
    // Silent — the banner will reappear next visit, acceptable degraded UX
  }
}

/**
 * Type-guarded parser used by tests and any defensive read path.
 * Pure, no side effects.
 */
export function parseConsentValue(raw: unknown): ConsentState {
  if (typeof raw !== 'string') return 'pending'
  return VALID.has(raw as ConsentState) ? (raw as ConsentState) : 'pending'
}
