'use client'
import { useEffect, useState } from 'react'
import type { Tour } from '@/lib/tours'
import type { BokunAvailability, BokunAvailabilityResponse } from '@/lib/bokun/types'
import { CLIENT_CHECKOUT_MODE } from '@/lib/bokun/checkout-mode'
import { formatStartTime, getBookingTotal } from '@/lib/bokun/snapshot'
import AvailabilityCalendar from '@/components/AvailabilityCalendar'
import CheckoutPanel from '@/components/CheckoutPanel'

type AvailabilityState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | {
      kind: 'ok'
      slots: number
      soldOut: boolean
      /** Full slot list — needed for the pickup-time picker when a tour
          exposes multiple slots (e.g. El Yunque's 4 bus departures). */
      availabilities: BokunAvailability[]
      /** First available slot of the selected date — used to seed the picker */
      firstSlot?: BokunAvailability
    }

const BOKUN_CHANNEL_UUID = process.env.NEXT_PUBLIC_BOKUN_CHANNEL_UUID

export default function BookingSidebar({ tour }: { tour: Tour }) {
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [availability, setAvailability] = useState<AvailabilityState>({ kind: 'idle' })
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(undefined)
  const [inCheckout, setInCheckout] = useState(false)

  useEffect(() => {
    setSelectedSlotId(undefined)
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
        // First non-soldout slot seeds the picker; user can switch in UI.
        const firstSlot =
          data.availabilities.find(a => !a.soldOut) ?? data.availabilities[0]
        setAvailability({
          kind: 'ok',
          slots: sumSlots,
          soldOut,
          availabilities: data.availabilities,
          firstSlot,
        })
        setSelectedSlotId(firstSlot?.id)
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setAvailability({ kind: 'error', message: 'Could not check availability' })
      })
    return () => ctrl.abort()
  }, [date, tour.bokunProductId])

  const selectedSlot =
    availability.kind === 'ok'
      ? availability.availabilities.find(s => s.id === selectedSlotId) ?? availability.firstSlot
      : undefined

  // Total respects tour.pricedPerPerson (set by Bokun enrichment). Flat-
  // fee tours like the private catamaran charter charge the same amount
  // regardless of guest count.
  const total = getBookingTotal(tour, Number(guests) || 1)
  const bokunConfigured = Boolean(tour.bokunProductId && BOKUN_CHANNEL_UUID)
  const bokunCheckoutUrl = bokunConfigured
    ? `https://widgets.bokun.io/online-sales/${BOKUN_CHANNEL_UUID}/experience/${tour.bokunProductId}`
    : undefined
  const customCheckoutEnabled =
    CLIENT_CHECKOUT_MODE !== 'disabled' && tour.bokunProductId !== undefined

  // Custom checkout active — replace the whole sidebar with CheckoutPanel.
  if (customCheckoutEnabled && inCheckout && availability.kind === 'ok' && selectedSlot) {
    const slot = selectedSlot
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
    (availability.kind !== 'ok' || availability.soldOut || !selectedSlot)

  return (
    <aside className="sticky top-[80px] glass-luxe rounded-sm overflow-hidden">
      <header className="bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-5">
        <p className="text-[9px] font-medium tracking-[0.2em] uppercase text-[#248D6C] mb-1.5">Starting from</p>
        <p className="text-[36px] font-light text-[#111] leading-none tracking-tight">${tour.price}</p>
        <p className="text-[11px] text-[#888] mt-1 font-light">{tour.priceNote}</p>
      </header>

      <div className="p-6 space-y-3">
        <div>
          <label htmlFor="bs-date" className="block text-[9px] font-normal tracking-[0.14em] uppercase text-[#888] mb-1.5">Preferred date</label>
          <AvailabilityCalendar
            productId={tour.bokunProductId}
            selected={date}
            onSelect={setDate}
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

        {availability.kind === 'ok' && !availability.soldOut && availability.availabilities.length === 1 && (
          <SidebarSlotLine slot={availability.availabilities[0]} />
        )}
        {availability.kind === 'ok' && availability.availabilities.length > 1 && (
          <SidebarSlotPicker
            slots={availability.availabilities}
            selectedId={selectedSlotId}
            onSelect={setSelectedSlotId}
          />
        )}

        <div className="flex items-baseline justify-between pt-2 border-t border-[#f0f0f0]">
          <span className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#888]">Total</span>
          <span className="text-[22px] font-light text-[#111] tracking-tight">${total}</span>
        </div>

        {customCheckoutEnabled ? (
          <button
            type="button"
            disabled={disableSubmit}
            onClick={() => setInCheckout(true)}
            className="cta-breathe block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] mt-3 disabled:opacity-60"
          >
            {availability.kind === 'ok' && availability.soldOut
              ? 'Sold out — pick another date'
              : !date
                ? 'Pick a date to continue'
                : `Confirm booking — $${total}`}
          </button>
        ) : bokunCheckoutUrl ? (
          <a
            className="cta-breathe bokunButton block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] mt-3 aria-[disabled=true]:opacity-60"
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
            className="cta-breathe block w-full bg-[#248D6C] text-white text-center text-[10px] font-semibold tracking-[0.16em] uppercase py-3.5 hover:bg-[#1C6E54] mt-3"
            href={`mailto:micasaventuras@gmail.com?subject=Booking%20request%20${encodeURIComponent(tour.name)}`}
          >
            Book by email — ${total}
          </a>
        )}

        <p className="text-[9.5px] text-center text-[#aaa] font-light">
          {tour.bokunSnapshot?.cancellationHours != null
            ? `Free cancellation up to ${tour.bokunSnapshot.cancellationHours}h · Instant confirmation`
            : 'Free cancellation up to 24h · Instant confirmation'}
        </p>
      </div>
    </aside>
  )
}

function SidebarSlotLine({ slot }: { slot: BokunAvailability }) {
  // Static single-slot label for the tour detail sidebar. Visual echoes
  // SidebarSlotPicker row so the two variants read as one family.
  const time = formatStartTime(slot.startTime) ?? slot.startTime ?? slot.id
  const count = slot.availabilityCount ?? 0
  return (
    <div
      className="border border-[#E5E5E5] flex items-center justify-between gap-4 px-3 py-2.5 bg-[#FAFAFA]"
      data-test="sidebar-slot-line"
    >
      <span className="text-[13px] font-light text-[#111]">{time}</span>
      <span className="text-[11px] font-light text-[#4F4F4E]">
        {count} {count === 1 ? 'spot' : 'spots'}
      </span>
    </div>
  )
}

function SidebarSlotPicker({
  slots,
  selectedId,
  onSelect,
}: {
  slots: BokunAvailability[]
  selectedId: string | undefined
  onSelect: (id: string) => void
}) {
  const ordered = [...slots].sort((a, b) => (a.startTime ?? '').localeCompare(b.startTime ?? ''))
  return (
    <div
      role="radiogroup"
      aria-label="Pickup time"
      className="border border-[#E5E5E5] divide-y divide-[#E5E5E5]"
    >
      <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-[#888] px-3 py-2 bg-[#FAFAFA]">
        Pickup time
      </p>
      {ordered.map(slot => {
        const disabled = slot.soldOut || (slot.availabilityCount ?? 0) <= 0
        const time = formatStartTime(slot.startTime) ?? slot.startTime ?? slot.id
        const count = slot.availabilityCount ?? 0
        const isSelected = slot.id === selectedId
        return (
          <label
            key={slot.id}
            data-test={`slot-option-${slot.id}`}
            data-selected={isSelected}
            className={`flex items-center justify-between gap-4 px-3 py-2.5 cursor-pointer transition-colors ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : isSelected
                  ? 'bg-[#E6F3EE]'
                  : 'hover:bg-[#FAFAFA]'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <input
                type="radio"
                name="sidebar-slot"
                value={slot.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onSelect(slot.id)}
                className="accent-[#248D6C]"
              />
              <span className="text-[13px] font-light text-[#111]">{time}</span>
            </span>
            <span className="text-[11px] font-light text-[#4F4F4E]">
              {disabled ? 'Sold out' : `${count} ${count === 1 ? 'spot' : 'spots'}`}
            </span>
          </label>
        )
      })}
    </div>
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
