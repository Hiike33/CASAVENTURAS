'use client'
import { useEffect, useState } from 'react'
import type { Tour } from '@/lib/tours'
import type { BokunAvailability, BokunAvailabilityResponse } from '@/lib/bokun/types'
import { CLIENT_CHECKOUT_MODE } from '@/lib/bokun/checkout-mode'
import CheckoutPanel from '@/components/CheckoutPanel'

type AvailabilityState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ok'
      slots: number
      soldOut: boolean
      /** First available slot of the selected date — used to seed CheckoutPanel */
      firstSlot?: BokunAvailability
    }

const BOKUN_CHANNEL_UUID = process.env.NEXT_PUBLIC_BOKUN_CHANNEL_UUID

export default function BookingSidebar({ tour }: { tour: Tour }) {
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityState>({ kind: 'idle' })
  const [inCheckout, setInCheckout] = useState(false)

  useEffect(() => {
    if (!date || !tour.bokunProductId) return
    const ctrl = new AbortController()
    setAvailability({ kind: 'loading' })
    fetch(
      `/api/bokun/availability?productId=${tour.bokunProductId}&start=${date}&end=${date}`,
      { signal: ctrl.signal },
    )
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
        // First non-soldout slot is our default choice for the checkout panel.
        const firstSlot =
          data.availabilities.find(a => !a.soldOut) ?? data.availabilities[0]
        setAvailability({ kind: 'ok', slots: sumSlots, soldOut, firstSlot })
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setAvailability({ kind: 'error', message: 'Could not check availability' })
      })
    return () => ctrl.abort()
  }, [date, tour.bokunProductId])

  const total = tour.price * Math.max(1, Number(guests) || 1)
  const bokunConfigured = Boolean(tour.bokunProductId && BOKUN_CHANNEL_UUID)
  const bokunCheckoutUrl = bokunConfigured
    ? `https://widgets.bokun.io/online-sales/${BOKUN_CHANNEL_UUID}/experience/${tour.bokunProductId}`
    : undefined
  const customCheckoutEnabled =
    CLIENT_CHECKOUT_MODE !== 'disabled' && tour.bokunProductId !== undefined

  // Custom checkout active — replace the whole sidebar with CheckoutPanel.
  if (customCheckoutEnabled && inCheckout && availability.kind === 'ok' && availability.firstSlot) {
    const slot = availability.firstSlot
    const slotDate =
      typeof slot.date === 'number'
        ? new Date(slot.date).toISOString().slice(0, 10)
        : date
    const label = slot.startTimeLabel
      ? `${slot.startTimeLabel}${slot.startTime ? ` · ${slot.startTime}` : ''}`
      : slot.startTime ?? ''
    return (
      <div className="sticky top-[80px]">
        <CheckoutPanel
          tour={tour}
          date={slotDate}
          startTimeId={Number((slot as unknown as { startTimeId?: number }).startTimeId ?? 0)}
          rateId={Number((slot as unknown as { defaultRateId?: number }).defaultRateId ?? 0)}
          startTimeLabel={label}
          onClose={() => setInCheckout(false)}
        />
      </div>
    )
  }

  const disableSubmit =
    customCheckoutEnabled &&
    (availability.kind !== 'ok' ||
      availability.soldOut ||
      !availability.firstSlot)

  return (
    <aside className="sticky top-[80px] border border-[#E5E5E5] bg-white">
      <header className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-5">
        <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5">Starting from</p>
        <p className="text-[36px] font-light text-[#111] leading-none tracking-tight">${tour.price}</p>
        <p className="text-[11px] text-[#888] mt-1 font-light">{tour.priceNote}</p>
      </header>

      <div className="p-6 space-y-3">
        <div>
          <label htmlFor="bs-date" className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Preferred date</label>
          <input
            id="bs-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().slice(0, 10)}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>

        <div>
          <label htmlFor="bs-guests" className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Guests</label>
          <input
            id="bs-guests"
            type="number"
            min={1}
            max={13}
            value={guests}
            onChange={e => setGuests(e.target.value)}
            className="w-full border border-[#e8e8e8] text-[#111] text-[13px] font-light px-3.5 py-2.5 outline-none focus:border-[#248D6C] transition-colors"
          />
        </div>

        <AvailabilityLine state={availability} date={date} />

        <div className="flex items-baseline justify-between pt-2 border-t border-[#f0f0f0]">
          <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#888]">Total</span>
          <span className="text-[22px] font-light text-[#111] tracking-tight">${total}</span>
        </div>

        {customCheckoutEnabled ? (
          <button
            type="button"
            disabled={disableSubmit}
            onClick={() => setInCheckout(true)}
            className="block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors mt-3 disabled:opacity-60"
          >
            {availability.kind === 'ok' && availability.soldOut
              ? 'Sold out — pick another date'
              : !date
                ? 'Pick a date to continue'
                : `Confirm booking — $${total}`}
          </button>
        ) : bokunCheckoutUrl ? (
          <a
            className="bokunButton block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors mt-3 aria-[disabled=true]:opacity-60"
            href={bokunCheckoutUrl}
            data-src={bokunCheckoutUrl}
            aria-disabled={availability.kind === 'ok' && availability.soldOut ? 'true' : undefined}
          >
            {availability.kind === 'ok' && availability.soldOut
              ? 'Sold out — pick another date'
              : `Confirm booking — $${total}`}
          </a>
        ) : (
          <a
            className="block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] transition-colors mt-3"
            href={`mailto:micasaventuras@gmail.com?subject=Booking%20request%20${encodeURIComponent(tour.name)}`}
          >
            Book by email — ${total}
          </a>
        )}

        <p className="text-[9.5px] text-center text-[#aaa] font-light">
          Free cancellation up to 24h · Instant confirmation
        </p>
      </div>
    </aside>
  )
}

function AvailabilityLine({
  state,
  date,
}: {
  state: AvailabilityState
  date: string
}) {
  if (state.kind === 'idle' && !date) {
    return <p className="text-[11px] font-light text-[#888] min-h-[16px]">Pick a date to see availability.</p>
  }
  if (state.kind === 'loading') {
    return <p className="text-[11px] font-light text-[#888] min-h-[16px]">Checking availability…</p>
  }
  if (state.kind === 'error') {
    return <p className="text-[11px] font-light text-red-600 min-h-[16px]">{state.message}</p>
  }
  if (state.kind === 'ok') {
    if (state.soldOut) {
      return <p className="text-[11px] font-medium text-red-600 min-h-[16px]">Sold out on this date</p>
    }
    if (state.slots > 0) {
      return (
        <p className="text-[11px] font-medium text-[#248D6C] min-h-[16px]">
          {state.slots} {state.slots === 1 ? 'spot' : 'spots'} available
        </p>
      )
    }
    return <p className="text-[11px] font-light text-[#888] min-h-[16px]">No availability on this date</p>
  }
  return <p className="min-h-[16px]" />
}
