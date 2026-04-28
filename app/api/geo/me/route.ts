import { NextResponse, type NextRequest } from 'next/server'

// GET /api/geo/me
//
// Returns the visitor's country + city (and a derived `isLocalPR` boolean)
// based on Cloudflare's `cf-ipcountry` / `cf-ipcity` request headers.
//
// Why an endpoint and not a cookie / inline server data :
//   • A cookie would be PII-tinted and require a cookie-policy update.
//   • Inlining the values via Server Component would opt the entire
//     app out of ISR — which we use for live prices (revalidate: 60).
//     Keeping the lookup behind a dedicated endpoint preserves ISR
//     for everything else.
//   • The route reads ONLY headers, no DB / no I/O — its cost on
//     Cloudflare Workers is sub-millisecond.
//
// Consumed by components/GoogleAnalytics.tsx after consent + after
// hydration : the fetched country/city are set as gtag `user_properties`
// so GA4 reports can segment by Puerto-Rico-local vs tourist, by source
// city, etc. Cookieless — works in both granted and denied consent modes
// (GA4 still ingests them in its cookieless ping flow).
//
// Privacy note : we never persist these values server-side. The response
// is `cache-control: no-store` so a future user behind the same Cloudflare
// edge POP isn't served the previous user's geo by mistake.
//
// Why `request.headers` instead of `headers()` from `next/headers` :
// the original implementation imported `headers()` from `next/headers`,
// which triggered Next.js 15's auto-inference to classify this route as
// edge runtime — even though we never declared it. OpenNext Cloudflare
// then crashed with `cannot use the edge runtime`. Reading headers from
// the request parameter sidesteps the inference (same pattern used in
// the sibling `app/api/geo/search/route.ts`). The explicit `runtime`
// declaration below is belt-and-suspenders defense.

export const runtime = 'nodejs'

type GeoResponse = {
  country: string | null
  city: string | null
  isLocalPR: boolean
}

export async function GET(request: NextRequest): Promise<NextResponse<GeoResponse>> {
  // Cloudflare Workers populate these on every request reaching the
  // origin. Locally (next dev without the CF proxy) they're absent —
  // we return nulls and the client treats it as "geo unknown".
  const country = request.headers.get('cf-ipcountry') ?? null
  const city = request.headers.get('cf-ipcity') ?? null
  return NextResponse.json(
    {
      country,
      city,
      isLocalPR: country === 'PR',
    },
    {
      // No edge cache — country/city are per-request facts, never
      // shareable across visitors.
      headers: {
        'cache-control': 'no-store, no-cache, must-revalidate',
      },
    },
  )
}
