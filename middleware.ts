import { NextResponse, type NextRequest } from 'next/server'

// Single source of truth for response security headers. Runs on every
// request that matches the matcher (all pages + API routes; static assets
// are excluded — they don't need CSP and would bloat image requests).
//
// Trade-offs documented inline:
// - 'unsafe-inline' in script-src is required because Next.js App Router
//   emits inline runtime scripts and JSON-LD <script> tags on every page.
//   Upgrading to nonce-based CSP requires making pages dynamic (not SSG),
//   which hurts CDN caching. Accepted for MVP — revisit when volume grows.
// - img-src allows all https: because tour photos pull from OTA feeds
//   (TripAdvisor, Viator photo URLs). Safe since we never execute images.
// - frame-ancestors 'none' blocks click-jacking globally (no one iframes us).

const CSP_DIRECTIVES: Record<string, readonly string[]> = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Next.js inline scripts + JSON-LD data
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
}

const CSP_VALUE = Object.entries(CSP_DIRECTIVES)
  .map(([k, v]) => (v.length ? `${k} ${v.join(' ')}` : k))
  .join('; ')

export function middleware(_req: NextRequest) {
  const res = NextResponse.next()
  // HSTS: 1 year, includes subdomains, submitted to preload list after GA.
  res.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  )
  // Prevent MIME type sniffing (old IE / Chrome) — pair with correct Content-Type.
  res.headers.set('X-Content-Type-Options', 'nosniff')
  // Tell browsers to send full URL only to same-origin navigations.
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Block iframing except same-origin (defence-in-depth to frame-ancestors).
  res.headers.set('X-Frame-Options', 'SAMEORIGIN')
  // Disable all powerful browser APIs we don't use. Tour booking site ≠
  // anything that needs camera/mic/geolocation/USB/payment (Stripe iframe
  // has its own allowance via Payment Request API scoped to its own frame).
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
  // Hide framework identity — small infoleak, cheap to suppress.
  res.headers.delete('X-Powered-By')
  return res
}

export const config = {
  matcher: [
    // Apply to everything EXCEPT static assets (images/videos/_next/static)
    // and favicons. Those don't need CSP and the header bytes add up on
    // heavily-cached requests.
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|mp4|webm|ico)$).*)',
  ],
}
