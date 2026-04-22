import { NextRequest, NextResponse } from 'next/server'
import { bokunFetch, BokunConfigError } from '@/lib/bokun/client'

// GET /api/bokun/checkout-context?productId=448405
//
// One-shot endpoint that returns the full set of vendor-configured data
// the checkout UI needs to render dynamically: pickup places, pricing
// categories, required customer fields, cancellation policy, and any
// custom booking questions. Two upstream calls are issued in parallel.
//
// Shape is UI-friendly (minimal, typed), not a passthrough — we only expose
// what the front-end actually consumes so the component stays focused.

export type PricingCategory = {
  id: number
  title: string
  ticketCategory: 'ADULT' | 'CHILD' | 'INFANT' | 'YOUTH' | 'SENIOR' | string
  minAge?: number
  maxAge?: number
  defaultCategory?: boolean
}

export type PickupPlace = {
  id: number
  title: string
  askForRoomNumber?: boolean
}

export type BookingQuestion = {
  id: number
  label: string
  type: 'TEXT' | 'LONG_TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | string
  required: boolean
  options?: string[]
}

export type CancellationPolicy = {
  title: string
  /** Human-derived summary from Bokun's penaltyRules (e.g., "24h") */
  fullRefundBeforeHours?: number
}

export type StartPoint = {
  title: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  countryCode?: string
  geoPoint?: { latitude: number; longitude: number }
}

export type CheckoutContext = {
  productId: number
  title: string
  /** "PICK_UP" | "MEET_ON_LOCATION" | ... */
  meetingType: string
  pickupService: boolean
  customPickupAllowed: boolean
  startPoints: StartPoint[]
  pricingCategories: PricingCategory[]
  pickupPlaces: PickupPlace[]
  bookingQuestions: BookingQuestion[]
  requiredCustomerFields: string[]
  cancellationPolicy: CancellationPolicy
  content: {
    included?: string
    excluded?: string
    attention?: string
    requirements?: string
  }
}

type Ok = { ok: true; context: CheckoutContext }
type Err = { ok: false; error: string; status?: number }

type BokunActivity = {
  id: number
  title: string
  meetingType?: string
  pickupService?: boolean
  customPickupAllowed?: boolean
  startPoints?: BokunStartPoint[]
  pricingCategories?: PricingCategory[]
  bookingQuestions?: unknown[]
  requiredCustomerFields?: string[]
  cancellationPolicy?: {
    title?: string
    penaltyRules?: { cutoffHours: number; charge: number }[]
  }
  included?: string | null
  excluded?: string | null
  attention?: string | null
  requirements?: string | null
}

type BokunStartPoint = {
  title?: string
  address?: {
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
    countryCode?: string | null
    geoPoint?: { latitude: number; longitude: number } | null
  }
}

type BokunPickupResponse = { pickupPlaces?: PickupPlace[] }

function deriveCancellationHours(
  policy?: BokunActivity['cancellationPolicy'],
): number | undefined {
  const rules = policy?.penaltyRules ?? []
  // Bokun expresses the policy as "within X hours of the tour, charge Y%".
  // "Free cancellation up to X hours" is the smallest cutoff at which a
  // non-zero charge kicks in — cancel earlier than that and you pay 0.
  // Example rules: [{24h, 100%}, {24000h, 0%}] → threshold = 24h.
  const chargeRules = rules.filter(r => r.charge > 0)
  if (chargeRules.length === 0) return undefined
  return Math.min(...chargeRules.map(r => r.cutoffHours))
}

export async function GET(req: NextRequest): Promise<NextResponse<Ok | Err>> {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId || !/^\d+$/.test(productId)) {
    return NextResponse.json(
      { ok: false, error: 'productId is required and must be numeric' },
      { status: 400 },
    )
  }

  try {
    const channelUuid = process.env.NEXT_PUBLIC_BOKUN_CHANNEL_UUID
    const channelQuery = channelUuid ? `?bookingChannelUUID=${channelUuid}` : ''
    const [actRes, pickupRes] = await Promise.all([
      bokunFetch(`/activity.json/${productId}${channelQuery}`),
      bokunFetch(`/activity.json/${productId}/pickup-places${channelQuery}`),
    ])

    if (!actRes.ok) {
      return NextResponse.json(
        { ok: false, error: 'Bokun activity fetch failed', status: actRes.status },
        { status: 502 },
      )
    }

    const act = (await actRes.json()) as BokunActivity
    const pickupData = pickupRes.ok
      ? ((await pickupRes.json()) as BokunPickupResponse)
      : { pickupPlaces: [] }

    const context: CheckoutContext = {
      productId: act.id,
      title: act.title,
      meetingType: act.meetingType ?? '',
      pickupService: Boolean(act.pickupService),
      customPickupAllowed: Boolean(act.customPickupAllowed),
      startPoints: (act.startPoints ?? []).map<StartPoint>(sp => ({
        title: sp.title ?? '',
        addressLine1: sp.address?.addressLine1 ?? undefined,
        addressLine2: sp.address?.addressLine2 ?? undefined,
        city: sp.address?.city ?? undefined,
        state: sp.address?.state ?? undefined,
        postalCode: sp.address?.postalCode ?? undefined,
        countryCode: sp.address?.countryCode ?? undefined,
        geoPoint: sp.address?.geoPoint ?? undefined,
      })),
      pricingCategories: (act.pricingCategories ?? []).map(c => ({
        id: c.id,
        title: c.title,
        ticketCategory: c.ticketCategory,
        minAge: c.minAge,
        maxAge: c.maxAge,
        defaultCategory: c.defaultCategory,
      })),
      pickupPlaces: (pickupData.pickupPlaces ?? []).map(p => ({
        id: p.id,
        title: p.title,
        askForRoomNumber: p.askForRoomNumber,
      })),
      bookingQuestions: (act.bookingQuestions ?? []).map((raw, i) => {
        const q = raw as Partial<BookingQuestion>
        return {
          id: q.id ?? i,
          label: q.label ?? `Question ${i + 1}`,
          type: q.type ?? 'TEXT',
          required: q.required ?? false,
          options: q.options,
        }
      }),
      requiredCustomerFields: Array.isArray(act.requiredCustomerFields)
        ? act.requiredCustomerFields
        : [],
      cancellationPolicy: {
        title: act.cancellationPolicy?.title ?? '',
        fullRefundBeforeHours: deriveCancellationHours(act.cancellationPolicy),
      },
      content: {
        included: act.included ?? undefined,
        excluded: act.excluded ?? undefined,
        attention: act.attention ?? undefined,
        requirements: act.requirements ?? undefined,
      },
    }

    return NextResponse.json({ ok: true, context })
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
