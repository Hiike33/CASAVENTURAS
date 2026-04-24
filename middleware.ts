import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'
import { CSP_VALUE } from './lib/security/csp'

// Composes two responsibilities:
//   1. next-intl handles locale detection and routing (rewrites /es/tours/...
//      to /[locale]/tours/ internally, sets NEXT_LOCALE cookie, handles
//      redirects when the URL is missing a locale prefix).
//   2. We overlay the security headers on whatever response it produced.
//
// The CSP itself lives in lib/security/csp.ts so it can be unit-tested
// without the Next.js runtime (see lib/security/csp.test.ts).

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
