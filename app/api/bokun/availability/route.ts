import { NextRequest, NextResponse } from 'next/server'
import { bokunFetch, BokunConfigError } from '@/lib/bokun/client'
import type { BokunAvailability, BokunAvailabilityResponse } from '@/lib/bokun/types'

// GET /api/bokun/availability?productId=448405&start=2026-05-15&end=2026-05-22
//
// Proxies Bókun's availability lookup so the secret key never leaves the server.
// The client-facing BookingSidebar calls this route; the HMAC-signed upstream
// call is the only place BOKUN_SECRET_KEY is read.

export async function GET(req: NextRequest): Promise<NextResponse<BokunAvailabilityResponse>> {
  const params = req.nextUrl.searchParams
  const productId = params.get('productId')
  const start = params.get('start')
  const end = params.get('end')

  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json(
      { ok: false, error: 'productId is required and must be numeric' },
      { status: 400 },
    )
  }
  if (!start || !/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    return NextResponse.json(
      { ok: false, error: 'start date (yyyy-MM-dd) is required' },
      { status: 400 },
    )
  }
  if (!end || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return NextResponse.json(
      { ok: false, error: 'end date (yyyy-MM-dd) is required' },
      { status: 400 },
    )
  }

  const path = `/booking.json/product/${productId}/availabilities?start=${start}&end=${end}`

  try {
    const res = await bokunFetch(path)
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      return NextResponse.json(
        { ok: false, error: 'Bokun upstream error', status: res.status, detail },
        { status: 502 },
      )
    }
    const raw = (await res.json()) as unknown
    const availabilities: BokunAvailability[] = Array.isArray(raw) ? (raw as BokunAvailability[]) : []
    return NextResponse.json({ ok: true, availabilities })
  } catch (err) {
    if (err instanceof BokunConfigError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
    return NextResponse.json(
      { ok: false, error: 'Failed to reach Bokun API' },
      { status: 500 },
    )
  }
}
