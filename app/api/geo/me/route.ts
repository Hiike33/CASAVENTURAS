import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

// GET /api/geo/me
//
// Returns the visitor's country + city (and a derived `isLocalPR` boolean)
// based on Cloudflare's `cf-ipcountry` / `cf-ipcity` request headers.
//
// Why an endpoint and not a cookie / inline server data :
//   • A cookie would be PII-tinted and require a cookie-policy update.
//   • Inlining the values via Server Component `headers()` in the root
//     layout opts the entire app out of ISR — which we use for live
//     prices (revalidate: 60). Keeping the lookup behind a dedicated
//     endpoint preserves ISR for everything else.
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
// Runtime : we deliberately do NOT declare `runtime = 'edge'` here.
// OpenNext Cloudflare bundles every route into a single Worker; declaring
// edge runtime forces Next.js to split this route into a separate bundle,
// which OpenNext refuses (build error: `cannot use the edge runtime`).
// On CF Workers with `nodejs_compat`, the default Node-style runtime IS
// already a V8 isolate at the edge — the label is what differs, not the
// physical environment. Since this route only reads request headers
// (no Node-only APIs), it runs identically on either runtime.

type GeoResponse = {
  country: string | null
  city: string | null
  isLocalPR: boolean
}

export async function GET(): Promise<NextResponse<GeoResponse>> {
  const h = await headers()
  // Cloudflare Workers populate these on every request reaching the
  // origin. Locally (next dev without the CF proxy) they're absent —
  // we return nulls and the client treats it as "geo unknown".
  const country = h.get('cf-ipcountry') ?? null
  const city = h.get('cf-ipcity') ?? null
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
