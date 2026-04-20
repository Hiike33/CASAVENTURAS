import { NextRequest, NextResponse } from 'next/server'
import {
  formatNominatimResult,
  type DisplayPlace,
  type NominatimResult,
} from '@/lib/geo/nominatim'

// GET /api/geo/search?q=calle+loiza
//
// Server-side proxy to OpenStreetMap Nominatim so we can:
//   1. Set a proper User-Agent (required by the Nominatim fair-use policy).
//   2. Restrict the geographic scope to Puerto Rico server-side.
//   3. Add a thin in-memory cache to soften bursts and stay well under
//      Nominatim's 1 req/s soft limit.
//
// Policy: https://operations.osmfoundation.org/policies/nominatim/

const NOMINATIM_HOST = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'CasaVenturasWebsite/1.0 (micasaventuras@gmail.com)'

// Tiny LRU-ish cache. Keyed by normalized query; TTL 10 min. Plenty given
// real user traffic (autocomplete hits repeat strings while typing).
const CACHE = new Map<string, { at: number; payload: DisplayPlace[] }>()
const TTL_MS = 10 * 60 * 1000
const MAX_ENTRIES = 200

function cacheGet(key: string): DisplayPlace[] | null {
  const hit = CACHE.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > TTL_MS) {
    CACHE.delete(key)
    return null
  }
  return hit.payload
}

function cacheSet(key: string, payload: DisplayPlace[]): void {
  if (CACHE.size >= MAX_ENTRIES) {
    // Drop oldest — Map preserves insertion order.
    const first = CACHE.keys().next().value
    if (first !== undefined) CACHE.delete(first)
  }
  CACHE.set(key, { at: Date.now(), payload })
}

type Ok = { ok: true; results: DisplayPlace[] }
type Err = { ok: false; error: string }

export async function GET(req: NextRequest): Promise<NextResponse<Ok | Err>> {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 3) return NextResponse.json({ ok: true, results: [] })

  const cacheKey = q.toLowerCase()
  const cached = cacheGet(cacheKey)
  if (cached) return NextResponse.json({ ok: true, results: cached })

  const url = new URL(`${NOMINATIM_HOST}/search`)
  url.searchParams.set('q', q)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '8')
  url.searchParams.set('addressdetails', '1')
  // Puerto Rico reports country_code "us" in Nominatim (it's a US territory).
  // We restrict via geographic viewbox (west, north, east, south) + bounded=1
  // so only hits inside the PR island(s) come back.
  url.searchParams.set('viewbox', '-67.3,18.6,-65.2,17.9')
  url.searchParams.set('bounded', '1')

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      // Revalidate aggressively on the edge too.
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Upstream geo search failed (${res.status})` },
        { status: 502 },
      )
    }
    const raw = (await res.json()) as NominatimResult[]
    const results = raw
      .map(formatNominatimResult)
      .filter((r): r is DisplayPlace => r !== null)
    cacheSet(cacheKey, results)
    return NextResponse.json({ ok: true, results })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown'
    return NextResponse.json(
      { ok: false, error: `Geo search failed: ${msg}` },
      { status: 500 },
    )
  }
}
