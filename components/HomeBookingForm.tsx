'use client'
import { useEffect, useState } from 'react'
import { tours, siteConfig } from '@/lib/tours'
import type { BokunAvailability, BokunAvailabilityResponse } from '@/lib/bokun/types'

type AvailabilityState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; slots: number; soldOut: boolean }

const BOKUN_CHANNEL_UUID = process.env.NEXT_PUBLIC_BOKUN_CHANNEL_UUID

// On-request tours are listed in the selector but don't yet have a Bókun
// product configured — their slug is not in the `tours` array. Selecting
// them falls back to an email CTA.
const onRequestOptions = [
  { slug: 'rum', label: 'Rum Distillery Tour — on request' },
  { slug: 'surf', label: 'Learn to Surf — on request' },
]

export default function HomeBookingForm() {
  const [tourSlug, setTourSlug] = useState(tours[0].slug)
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityState>({ kind: 'idle' })

  const selectedTour = tours.find(t => t.slug === tourSlug)
  const productId = selectedTour?.bokunProductId
  const bokunConfigured = Boolean(productId && BOKUN_CHANNEL_UUID)

  // Re-run availability lookup whenever tour OR date changes. Reset to idle
  // when switching to an on-request tour (no product to query).
  useEffect(() => {
    setAvailability({ kind: 'idle' })
    if (!date || !productId) return
    const ctrl = new AbortController()
    setAvailability({ kind: 'loading' })
    fetch(`/api/bokun/availability?productId=${productId}&start=${date}&end=${date}`, {
      signal: ctrl.signal,
    })
      .then(async r => (await r.json()) as BokunAvailabilityResponse)
      .then(data => {
        if (!data.ok) {
          setAvailability({ kind: 'error', message: data.error })
          return
        }
        const sumSlots = data.availabilities.reduce<number>(
          (n: number, a: BokunAvailability) => n + (a.availabilityCount ?? 0),
          0,
        )
        const soldOut =
          data.availabilities.length > 0 && data.availabilities.every(a => a.soldOut)
        setAvailability({ kind: 'ok', slots: sumSlots, soldOut })
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setAvailability({ kind: 'error', message: 'Could not check availability' })
      })
    return () => ctrl.abort()
  }, [date, productId])

  const guestsNum = Math.max(1, Number(guests) || 1)
  const price = selectedTour?.price ?? 0
  const total = price * guestsNum

  const bokunCheckoutUrl = bokunConfigured
    ? `https://widgets.bokun.io/online-sales/${BOKUN_CHANNEL_UUID}/experience/${productId}`
    : undefined

  const mailtoFallback = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    `Booking request — ${tourSlug}`,
  )}&body=${encodeURIComponent(
    `Hello,\n\nI'd like to book: ${tourSlug}\nDate: ${date || 'flexible'}\nGuests: ${guestsNum}\n`,
  )}`

  return (
    <div className="bg-white border border-[#E5E5E5] p-8">
      <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#888] mb-6">Reservation form</p>

      <label htmlFor="hb-tour" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Select experience</label>
      <select
        id="hb-tour"
        value={tourSlug}
        onChange={e => setTourSlug(e.target.value)}
        className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 mb-4 outline-none focus:border-[#248D6C] transition-colors"
      >
        {tours.map(t => (
          <option key={t.slug} value={t.slug}>{t.name} — ${t.price}/person</option>
        ))}
        {onRequestOptions.map(o => (
          <option key={o.slug} value={o.slug}>{o.label}</option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label htmlFor="hb-date" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Date</label>
          <input
            id="hb-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="hb-guests" className="block text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] mb-1.5">Guests</label>
          <input
            id="hb-guests"
            type="number"
            min={1}
            max={13}
            value={guests}
            onChange={e => setGuests(e.target.value)}
            className="w-full bg-white border border-[#E5E5E5] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors placeholder:text-[#aaa]"
          />
        </div>
      </div>

      <HomeAvailabilityLine state={availability} date={date} bokunConfigured={bokunConfigured} />

      {selectedTour && (
        <div className="flex items-baseline justify-between py-2.5 border-t border-[#f0f0f0] mb-3">
          <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#888]">Total</span>
          <span className="text-[22px] font-light text-[#111] tracking-tight">${total}</span>
        </div>
      )}

      {bokunCheckoutUrl ? (
        <a
          className="bokunButton block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors aria-[disabled=true]:opacity-60"
          href={bokunCheckoutUrl}
          data-src={bokunCheckoutUrl}
          aria-disabled={availability.kind === 'ok' && availability.soldOut ? 'true' : undefined}
        >
          {availability.kind === 'ok' && availability.soldOut
            ? 'Sold out — pick another date'
            : 'Confirm booking'}
        </a>
      ) : (
        <a
          className="block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors"
          href={mailtoFallback}
        >
          Request by email
        </a>
      )}

      <p className="text-[9.5px] text-center text-[#888] mt-2.5 font-light">
        Free cancellation · Instant confirmation · No OTA fee
      </p>
    </div>
  )
}

function HomeAvailabilityLine({
  state,
  date,
  bokunConfigured,
}: {
  state: AvailabilityState
  date: string
  bokunConfigured: boolean
}) {
  if (!bokunConfigured) {
    return (
      <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">
        On request — we&apos;ll confirm availability by email.
      </p>
    )
  }
  if (state.kind === 'idle' && !date) {
    return <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">Pick a date to see availability.</p>
  }
  if (state.kind === 'loading') {
    return <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">Checking availability…</p>
  }
  if (state.kind === 'error') {
    return <p className="text-[11px] font-light text-red-600 min-h-[16px] mb-2">{state.message}</p>
  }
  if (state.kind === 'ok') {
    if (state.soldOut) {
      return <p className="text-[11px] font-medium text-red-600 min-h-[16px] mb-2">Sold out on this date</p>
    }
    if (state.slots > 0) {
      return (
        <p className="text-[11px] font-medium text-[#248D6C] min-h-[16px] mb-2">
          {state.slots} {state.slots === 1 ? 'spot' : 'spots'} available
        </p>
      )
    }
    return <p className="text-[11px] font-light text-[#888] min-h-[16px] mb-2">No availability on this date</p>
  }
  return <p className="min-h-[16px] mb-2" />
}
