// Content Security Policy — single source of truth.
// Consumed by middleware.ts which sets the `Content-Security-Policy` header
// on every non-static response. Kept here (not inline in middleware.ts) so
// the directives can be unit-tested without pulling the Next.js runtime.
//
// Adding a new origin:
// 1. Add it to the correct directive below (script-src / connect-src / ...).
// 2. Update lib/security/csp.test.ts with an assertion covering the new origin.
// 3. Ship. CSP violations for the old policy briefly show up in the reporting
//    pipeline (D-020bis, /api/csp-report) while caches drain — normal.

export const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'https://js.stripe.com',
    'https://widgets.bokun.io',
    'https://static.bokun.io',
    'https://static.cloudflareinsights.com',
    // Google Analytics 4 — gtag.js loader + analytics.js. Loaded by
    // components/GoogleAnalytics.tsx with Consent Mode v2 default-denied
    // so cookies are only set after explicit user consent (CookieConsentBanner).
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
  'connect-src': [
    "'self'",
    'https://api.stripe.com',
    'https://m.stripe.com',
    'https://m.stripe.network',
    'https://api.bokun.is',
    'https://nominatim.openstreetmap.org',
    'https://cloudflareinsights.com',
    // Google Analytics — measurement hit endpoints.
    //   • www.google-analytics.com : legacy /collect + gtag config fetch
    //   • analytics.google.com     : GA4 Measurement Protocol endpoint
    //   • *.google-analytics.com   : GA4 regional endpoints (region1,
    //     region2, ...) used for IP anonymisation. Without this wildcard,
    //     GA4 hits get silently CSP-blocked → zero conversion tracking
    //     despite the script loading. Verified live 2026-04-26 via
    //     Playwright console capture on prod (region1.google-analytics.com
    //     blocked → all events lost).
    'https://www.google-analytics.com',
    'https://*.google-analytics.com',
    'https://analytics.google.com',
  ],
  'frame-src': [
    'https://js.stripe.com',
    'https://hooks.stripe.com',
    'https://widgets.bokun.io',
    'https://www.youtube-nocookie.com',
    'https://www.youtube.com',
  ],
  'media-src': ["'self'", 'blob:', 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
  // Violation reporting — `report-uri` legacy, `report-to` modern (Reporting API).
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint'],
}

export const CSP_VALUE = Object.entries(CSP_DIRECTIVES)
  .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
  .join('; ')
