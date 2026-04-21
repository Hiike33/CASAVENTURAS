import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

// Composes two responsibilities:
//   1. next-intl handles locale detection and routing (rewrites /es/tours/...
//      to /[locale]/tours/ internally, sets NEXT_LOCALE cookie, handles
//      redirects when the URL is missing a locale prefix).
//   2. We overlay the security headers on whatever response it produced.
//
// Trade-offs documented inline:
// - 'unsafe-inline' in script-src is required because Next.js App Router
//   emits inline runtime scripts and JSON-LD <script> tags on every page.
// - img-src allows all https: because tour photos pull from OTA feeds
//   (TripAdvisor, Viator photo URLs). Safe since we never execute images.
// - frame-ancestors 'none' blocks click-jacking globally.

const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'https://js.stripe.com',
    'https://widgets.bokun.io',
    'https://static.bokun.io',
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
  // Violation reporting — `report-uri` is legacy, `report-to` is modern.
  // We emit both so older browsers keep sending reports while newer ones
  // prefer the Reporting API endpoint declared via Reporting-Endpoints.
  'report-uri': ['/api/csp-report'],
  'report-to': ['csp-endpoint'],
}

const CSP_VALUE = Object.entries(CSP_DIRECTIVES)
  .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
  .join('; ')

const intlMiddleware = createMiddleware(routing)

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  res.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'payment=(self "https://js.stripe.com")',
      'usb=()',
      'interest-cohort=()',
    ].join(', '),
  )
  res.headers.set('Content-Security-Policy', CSP_VALUE)
  res.headers.set('Reporting-Endpoints', 'csp-endpoint="/api/csp-report"')
  res.headers.delete('X-Powered-By')
  return res
}

export default function middleware(req: NextRequest) {
  // API routes skip i18n routing (they return JSON, not localized pages) but
  // still get security headers applied.
  if (req.nextUrl.pathname.startsWith('/api')) {
    return applySecurityHeaders(NextResponse.next())
  }
  const res = intlMiddleware(req)
  return applySecurityHeaders(res)
}

export const config = {
  matcher: [
    // Apply to everything EXCEPT static assets (images/videos/_next/static)
    // and favicons. Those don't need CSP and the header bytes add up on
    // heavily-cached requests.
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|mp4|webm|ico)$).*)',
  ],
}
