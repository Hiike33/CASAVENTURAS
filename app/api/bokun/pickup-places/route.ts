import { NextRequest, NextResponse } from 'next/server'
import { bokunFetch, BokunConfigError } from '@/lib/bokun/client'

// GET /api/bokun/pickup-places?productId=448405
//
// Proxies Bókun's pickup-places lookup. Returned payload is the list the
// vendor has configured for the activity — source of truth for the
// checkout hotel picker.

export type PickupPlace = {
  id: number
  title: string
  type?: string
  askForRoomNumber?: boolean
  externalId?: string | null
}

type Ok = { ok: true; pickupPlaces: PickupPlace[] }
type Err = { ok: false; error: string; status?: number }

export async function GET(req: NextRequest): Promise<NextResponse<Ok | Err>> {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json(
      { ok: false, error: 'productId is required and must be numeric' },
      { status: 400 },
    )
  }

  try {
    const res = await bokunFetch(`/activity.json/${productId}/pickup-places`)
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: 'Bokun upstream error', status: res.status },
        { status: 502 },
      )
    }
    const raw = (await res.json()) as { pickupPlaces?: PickupPlace[] }
    const pickupPlaces = Array.isArray(raw.pickupPlaces) ? raw.pickupPlaces : []
    return NextResponse.json({ ok: true, pickupPlaces })
  } catch (err) {
    if (err instanceof BokunConfigError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
    const msg = err instanceof Error ? err.message : 'unknown'
    return NextResponse.json(
      { ok: false, error: `Failed to reach Bokun API: ${msg}` },
      { status: 500 },
    )
  }
}
